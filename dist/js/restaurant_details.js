class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/restaurants"}static get DB_NAME(){return"mws-rr"}static get OBJECT_STORE_NAME(){return"restaurants"}static get DB_VER(){return 1}static getDb(){return idb.open(DBHelper.DB_NAME,DBHelper.DB_VER,e=>{e.createObjectStore(DBHelper.OBJECT_STORE_NAME,{keyPath:"id"}).createIndex("by-id","id")})}static fetchRestaurants(e){DBHelper.getDb().then(e=>{if(e)return e.transaction(DBHelper.OBJECT_STORE_NAME).objectStore(DBHelper.OBJECT_STORE_NAME).getAll()}).then(t=>{if(t&&t.length>0)return e(null,t);fetch(DBHelper.DATABASE_URL).then(t=>{const n=t.status;if(200!==n){return e(`Request failed. Returned status of ${n}`,null)}return t.json().then(t=>{DBHelper.getDb().then(e=>{if(!e)return;const n=e.transaction(DBHelper.OBJECT_STORE_NAME,"readwrite").objectStore(DBHelper.OBJECT_STORE_NAME);t.map(e=>n.put(e))}),e(null,t)})}).catch(t=>{e(`Request failed with error: ${t}`,null)})})}static fetchRestaurantById(e,t){fetch(`${DBHelper.DATABASE_URL}/${e}`).then(e=>{const n=e.status;return 404===n?t("Restaurant does not exist",null):200!==n?t("`Request failed. Returned status of ${status}`",null):e.json().then(e=>{t(null,e)})}).catch(e=>{t(`Request failed with error: ${e}`,null)})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.cuisine_type==e);t(null,n)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((n,r)=>{if(n)t(n,null);else{const n=r.filter(t=>t.neighborhood==e);t(null,n)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,n){DBHelper.fetchRestaurants((r,o)=>{if(r)n(r,null);else{let r=o;"all"!=e&&(r=r.filter(t=>t.cuisine_type==e)),"all"!=t&&(r=r.filter(e=>e.neighborhood==t)),n(null,r)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].neighborhood),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,n)=>{if(t)e(t,null);else{const t=n.map((e,t)=>n[t].cuisine_type),r=t.filter((e,n)=>t.indexOf(e)==n);e(null,r)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph?`/img/${e.photograph}.webp`:"/img/no_image_available.svg"}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let restaurant;var map;window.initMap=(()=>{fetchRestaurantFromURL((e,t)=>{e?console.error(e):(self.map=new google.maps.Map(document.getElementById("map"),{zoom:16,center:t.latlng,scrollwheel:!1}),fillBreadcrumb(),DBHelper.mapMarkerForRestaurant(self.restaurant,self.map))})}),fetchRestaurantFromURL=(e=>{if(self.restaurant)return void e(null,self.restaurant);const t=getParameterByName("id");t?DBHelper.fetchRestaurantById(t,(t,n)=>{self.restaurant=n,n?(fillRestaurantHTML(),e(null,n)):console.error(t)}):(error="No restaurant id in URL",e(error,null))}),fillRestaurantHTML=((e=self.restaurant)=>{document.getElementById("restaurant-name").innerHTML=e.name,document.getElementById("restaurant-address").innerHTML=e.address;const t=document.getElementById("restaurant-img");t.className="restaurant-img",t.alt="An image from the restaurant "+e.name,t.src=DBHelper.imageUrlForRestaurant(e),document.getElementById("restaurant-cuisine").innerHTML=e.cuisine_type,e.operating_hours&&fillRestaurantHoursHTML(),fillReviewsHTML()}),fillRestaurantHoursHTML=((e=self.restaurant.operating_hours)=>{const t=document.getElementById("restaurant-hours");for(let n in e){const r=document.createElement("tr"),o=document.createElement("td");o.innerHTML=n,r.appendChild(o);const a=document.createElement("td");a.innerHTML=e[n],r.appendChild(a),t.appendChild(r)}}),fillReviewsHTML=((e=self.restaurant.reviews)=>{const t=document.getElementById("reviews-container"),n=document.createElement("h3");if(n.innerHTML="Reviews",t.appendChild(n),!e){const e=document.createElement("p");return e.innerHTML="No reviews yet!",void t.appendChild(e)}const r=document.getElementById("reviews-list");e.forEach(e=>{r.appendChild(createReviewHTML(e))}),t.appendChild(r)}),createReviewHTML=(e=>{const t=document.createElement("li"),n=document.createElement("h4");n.classList.add("review-header"),t.appendChild(n);const r=document.createElement("p");r.className="review-name",r.innerHTML=e.name,n.appendChild(r);const o=document.createElement("p");o.className="review-date",o.innerHTML=e.date,n.appendChild(o);const a=document.createElement("p");a.className="review-rating",a.innerHTML=`Rating: ${e.rating}`,t.appendChild(a);const i=document.createElement("p");return i.innerHTML=e.comments,t.appendChild(i),t}),fillBreadcrumb=((e=self.restaurant)=>{const t=document.getElementById("breadcrumb"),n=document.createElement("li");n.innerHTML=e.name,t.appendChild(n)}),getParameterByName=((e,t)=>{t||(t=window.location.href),e=e.replace(/[\[\]]/g,"\\$&");const n=new RegExp(`[?&]${e}(=([^&#]*)|&|#|$)`).exec(t);return n?n[2]?decodeURIComponent(n[2].replace(/\+/g," ")):"":null}),"serviceWorker"in navigator?navigator.serviceWorker.register("/sw.js").then(function(e){console.log("Service worker registration succeeded:",e)}).catch(function(e){console.log("Service worker registration failed:",e)}):console.log("Service workers are not supported."),function(){function e(e){return new Promise(function(t,n){e.onsuccess=function(){t(e.result)},e.onerror=function(){n(e.error)}})}function t(t,n,r){var o,a=new Promise(function(a,i){e(o=t[n].apply(t,r)).then(a,i)});return a.request=o,a}function n(e,t,n){n.forEach(function(n){Object.defineProperty(e.prototype,n,{get:function(){return this[t][n]},set:function(e){this[t][n]=e}})})}function r(e,n,r,o){o.forEach(function(o){o in r.prototype&&(e.prototype[o]=function(){return t(this[n],o,arguments)})})}function o(e,t,n,r){r.forEach(function(r){r in n.prototype&&(e.prototype[r]=function(){return this[t][r].apply(this[t],arguments)})})}function a(e,n,r,o){o.forEach(function(o){o in r.prototype&&(e.prototype[o]=function(){return e=this[n],(r=t(e,o,arguments)).then(function(e){if(e)return new s(e,r.request)});var e,r})})}function i(e){this._index=e}function s(e,t){this._cursor=e,this._request=t}function u(e){this._store=e}function c(e){this._tx=e,this.complete=new Promise(function(t,n){e.oncomplete=function(){t()},e.onerror=function(){n(e.error)},e.onabort=function(){n(e.error)}})}function l(e,t,n){this._db=e,this.oldVersion=t,this.transaction=new c(n)}function p(e){this._db=e}n(i,"_index",["name","keyPath","multiEntry","unique"]),r(i,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),a(i,"_index",IDBIndex,["openCursor","openKeyCursor"]),n(s,"_cursor",["direction","key","primaryKey","value"]),r(s,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(t){t in IDBCursor.prototype&&(s.prototype[t]=function(){var n=this,r=arguments;return Promise.resolve().then(function(){return n._cursor[t].apply(n._cursor,r),e(n._request).then(function(e){if(e)return new s(e,n._request)})})})}),u.prototype.createIndex=function(){return new i(this._store.createIndex.apply(this._store,arguments))},u.prototype.index=function(){return new i(this._store.index.apply(this._store,arguments))},n(u,"_store",["name","keyPath","indexNames","autoIncrement"]),r(u,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),a(u,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),o(u,"_store",IDBObjectStore,["deleteIndex"]),c.prototype.objectStore=function(){return new u(this._tx.objectStore.apply(this._tx,arguments))},n(c,"_tx",["objectStoreNames","mode"]),o(c,"_tx",IDBTransaction,["abort"]),l.prototype.createObjectStore=function(){return new u(this._db.createObjectStore.apply(this._db,arguments))},n(l,"_db",["name","version","objectStoreNames"]),o(l,"_db",IDBDatabase,["deleteObjectStore","close"]),p.prototype.transaction=function(){return new c(this._db.transaction.apply(this._db,arguments))},n(p,"_db",["name","version","objectStoreNames"]),o(p,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(e){[u,i].forEach(function(t){t.prototype[e.replace("open","iterate")]=function(){var t,n=(t=arguments,Array.prototype.slice.call(t)),r=n[n.length-1],o=this._store||this._index,a=o[e].apply(o,n.slice(0,-1));a.onsuccess=function(){r(a.result)}}})}),[i,u].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,t){var n=this,r=[];return new Promise(function(o){n.iterateCursor(e,function(e){e?(r.push(e.value),void 0===t||r.length!=t?e.continue():o(r)):o(r)})})})});var d={open:function(e,n,r){var o=t(indexedDB,"open",[e,n]),a=o.request;return a.onupgradeneeded=function(e){r&&r(new l(a.result,e.oldVersion,a.transaction))},o.then(function(e){return new p(e)})},delete:function(e){return t(indexedDB,"deleteDatabase",[e])}};"undefined"!=typeof module?(module.exports=d,module.exports.default=module.exports):self.idb=d}();
//# sourceMappingURL=restaurant_details.js.map

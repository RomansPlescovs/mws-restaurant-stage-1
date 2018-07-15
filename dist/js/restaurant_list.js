class DBHelper{static get DATABASE_URL(){return"http://localhost:1337/"}static get RESTAURANT_URL(){return`${this.DATABASE_URL}restaurants/`}static get REVIEW_URL(){return`${this.DATABASE_URL}reviews/`}static get DB_NAME(){return"mws-rr"}static get RESTAURANT_STORE_NAME(){return"restaurants"}static get REVIEW_STORE_NAME(){return"reviews"}static get DB_VER(){return 2}static getDb(){return idb.open(DBHelper.DB_NAME,DBHelper.DB_VER,e=>{e.createObjectStore(DBHelper.RESTAURANT_STORE_NAME,{keyPath:"id"}).createIndex("by-id","id"),e.createObjectStore(DBHelper.REVIEW_STORE_NAME,{keyPath:"id"}).createIndex("by-id","id")})}static fetchRestaurants(e){DBHelper.getDb().then(e=>{if(e)return e.transaction(DBHelper.RESTAURANT_STORE_NAME).objectStore(DBHelper.RESTAURANT_STORE_NAME).getAll()}).then(t=>{if(t&&t.length>0)return e(null,t);fetch(DBHelper.RESTAURANT_URL).then(t=>{const r=t.status;if(200!==r){return e(`Request failed. Returned status of ${r}`,null)}return t.json().then(t=>{DBHelper.getDb().then(e=>{if(!e)return;const r=e.transaction(DBHelper.RESTAURANT_STORE_NAME,"readwrite").objectStore(DBHelper.RESTAURANT_STORE_NAME);t.map(e=>{r.put(e)})}),e(null,t)})}).catch(t=>{e(`Request failed with error: ${t}`,null)})})}static fetchRestaurantById(e,t){DBHelper.getDb().then(e=>{if(e)return e.transaction(DBHelper.RESTAURANT_STORE_NAME).objectStore(DBHelper.RESTAURANT_STORE_NAME).getAll()}).then(r=>{if(restaurant=r.find(t=>t.id==e),restaurant)return t(null,restaurant);fetch(`${DBHelper.RESTAURANT_URL}${e}`).then(e=>{const r=e.status;return 404===r?t("Restaurant does not exist",null):200!==r?t("`Request failed. Returned status of ${status}`",null):e.json().then(e=>{t(null,e)})}).catch(e=>{t(`Request failed with error: ${e}`,null)})})}static fetchReviewsByRestaurantId(e,t){DBHelper.getDb().then(e=>{if(e)return e.transaction(DBHelper.REVIEW_STORE_NAME).objectStore(DBHelper.REVIEW_STORE_NAME).getAll()}).then(r=>{if((r=r.filter(t=>t.restaurant_id===e))&&r.length>0)return t(null,r);fetch(`${DBHelper.REVIEW_URL}?restaurant_id=${e}`).then(e=>{const r=e.status;return 404===r?t("Restaurant does not exist",null):200!==r?t("`Request failed. Returned status of ${status}`",null):e.json().then(e=>{DBHelper.getDb().then(t=>{if(!t)return;const r=t.transaction(DBHelper.REVIEW_STORE_NAME,"readwrite").objectStore(DBHelper.REVIEW_STORE_NAME);e.map(e=>r.put(e))}),t(null,e)})}).catch(e=>{t(`Request failed with error: ${e}`,null)})})}static createRestaurantReview(e){e&&fetch(`${DBHelper.REVIEW_URL}`,{method:"POST",body:JSON.stringify(e)}).then(t=>(201!=t.status?e.syncStatus="Pending":e.syncStatus="Success",t.json())).then(e=>{this.createRestaurantReviewDB(e)})}static createRestaurantReviewDB(e){DBHelper.getDb().then(t=>{if(!t)return;t.transaction(DBHelper.REVIEW_STORE_NAME,"readwrite").objectStore(DBHelper.REVIEW_STORE_NAME).put(e)})}static setFavoriteRestaurant(e,t){e&&(restaurant.is_favorite=state,fetch(`${DBHelper.RESTAURANT_URL}${e}/?is_favorite=${t}`,{method:"PUT"}).then(r=>{let n="Pending";200==r.status&&(n="Success"),DBHelper.setFavoriteRestaurantDB(e,t,n)}))}static setFavoriteRestaurantDB(e,t,r){DBHelper.getDb().then(n=>{if(!n)return;const o=n.transaction(DBHelper.RESTAURANT_STORE_NAME,"readwrite").objectStore(DBHelper.RESTAURANT_STORE_NAME).index("by-id");let s=IDBKeyRange.only(e);o.openCursor(s).then(e=>{if(e){let n=e.value;n.is_favorite=t,n.syncStatus=r,e.update(n)}})})}static fetchRestaurantByCuisine(e,t){DBHelper.fetchRestaurants((r,n)=>{if(r)t(r,null);else{const r=n.filter(t=>t.cuisine_type==e);t(null,r)}})}static fetchRestaurantByNeighborhood(e,t){DBHelper.fetchRestaurants((r,n)=>{if(r)t(r,null);else{const r=n.filter(t=>t.neighborhood==e);t(null,r)}})}static fetchRestaurantByCuisineAndNeighborhood(e,t,r){DBHelper.fetchRestaurants((n,o)=>{if(n)r(n,null);else{let n=o;"all"!=e&&(n=n.filter(t=>t.cuisine_type==e)),"all"!=t&&(n=n.filter(e=>e.neighborhood==t)),r(null,n)}})}static fetchNeighborhoods(e){DBHelper.fetchRestaurants((t,r)=>{if(t)e(t,null);else{const t=r.map((e,t)=>r[t].neighborhood),n=t.filter((e,r)=>t.indexOf(e)==r);e(null,n)}})}static fetchCuisines(e){DBHelper.fetchRestaurants((t,r)=>{if(t)e(t,null);else{const t=r.map((e,t)=>r[t].cuisine_type),n=t.filter((e,r)=>t.indexOf(e)==r);e(null,n)}})}static urlForRestaurant(e){return`./restaurant.html?id=${e.id}`}static imageUrlForRestaurant(e){return e.photograph?`img/${e.photograph}.webp`:"img/no_image_available.svg"}static mapMarkerForRestaurant(e,t){return new google.maps.Marker({position:e.latlng,title:e.name,url:DBHelper.urlForRestaurant(e),map:t,animation:google.maps.Animation.DROP})}}let restaurants,neighborhoods,cuisines;var map,markers=[];document.addEventListener("DOMContentLoaded",e=>{fetchNeighborhoods(),fetchCuisines()}),fetchNeighborhoods=(()=>{DBHelper.fetchNeighborhoods((e,t)=>{e?console.error(e):(self.neighborhoods=t,fillNeighborhoodsHTML())})}),fillNeighborhoodsHTML=((e=self.neighborhoods)=>{const t=document.getElementById("neighborhoods-select");e.forEach(e=>{const r=document.createElement("option");r.innerHTML=e,r.value=e,t.append(r)})}),fetchCuisines=(()=>{DBHelper.fetchCuisines((e,t)=>{e?console.error(e):(self.cuisines=t,fillCuisinesHTML())})}),fillCuisinesHTML=((e=self.cuisines)=>{const t=document.getElementById("cuisines-select");e.forEach(e=>{const r=document.createElement("option");r.innerHTML=e,r.value=e,t.append(r)})}),window.initMap=(()=>{self.map=new google.maps.Map(document.getElementById("map"),{zoom:12,center:{lat:40.722216,lng:-73.987501},scrollwheel:!1}),updateRestaurants()}),updateRestaurants=(()=>{const e=document.getElementById("cuisines-select"),t=document.getElementById("neighborhoods-select"),r=e.selectedIndex,n=t.selectedIndex,o=e[r].value,s=t[n].value;DBHelper.fetchRestaurantByCuisineAndNeighborhood(o,s,(e,t)=>{if(e)console.error(e);else{resetRestaurants(t),fillRestaurantsHTML(),lozad().observe(),console.log("lozad initialized")}})}),resetRestaurants=(e=>{self.restaurants=[],document.getElementById("restaurants-list").innerHTML="",self.markers.forEach(e=>e.setMap(null)),self.markers=[],self.restaurants=e}),fillRestaurantsHTML=((e=self.restaurants)=>{const t=document.getElementById("restaurants-list");e.forEach(e=>{t.append(createRestaurantHTML(e))}),addMarkersToMap()}),createRestaurantHTML=(e=>{const t=document.createElement("li"),r=document.createElement("img");r.className="restaurant-img lozad",r.setAttribute("data-src",DBHelper.imageUrlForRestaurant(e)),r.alt="An image from the restaurant "+e.name,t.append(r);const n=document.createElement("h3");n.innerHTML=e.name,t.append(n);const o=document.createElement("p");o.innerHTML=e.neighborhood,t.append(o);const s=document.createElement("p");s.innerHTML=e.address,t.append(s);const a=document.createElement("a");a.innerHTML="View Details",a.href=DBHelper.urlForRestaurant(e),t.append(a);const i=document.createElement("span");return i.innerHTML="&#x272a;",i.tabIndex="0",i.className="favorite-icon",e.is_favorite&&i.classList.add("is-favorite"),i.addEventListener("click",t=>{let r=e.is_favorite;e.is_favorite=!r,setFavoriteRestaurant(t.target,e.id,r)}),t.append(i),t}),setFavoriteRestaurant=((e,t,r)=>{r?e.classList.remove("is-favorite"):e.classList.add("is-favorite"),DBHelper.setFavoriteRestaurant(t,!r)}),addMarkersToMap=((e=self.restaurants)=>{e.forEach(e=>{const t=DBHelper.mapMarkerForRestaurant(e,self.map);google.maps.event.addListener(t,"click",()=>{window.location.href=t.url}),self.markers.push(t)})}),"serviceWorker"in navigator?navigator.serviceWorker.register("/sw.js").then(function(e){console.log("Service worker registration succeeded:",e)}).catch(function(e){console.log("Service worker registration failed:",e)}):console.log("Service workers are not supported."),function(){function e(e){return new Promise(function(t,r){e.onsuccess=function(){t(e.result)},e.onerror=function(){r(e.error)}})}function t(t,r,n){var o,s=new Promise(function(s,a){e(o=t[r].apply(t,n)).then(s,a)});return s.request=o,s}function r(e,t,r){r.forEach(function(r){Object.defineProperty(e.prototype,r,{get:function(){return this[t][r]},set:function(e){this[t][r]=e}})})}function n(e,r,n,o){o.forEach(function(o){o in n.prototype&&(e.prototype[o]=function(){return t(this[r],o,arguments)})})}function o(e,t,r,n){n.forEach(function(n){n in r.prototype&&(e.prototype[n]=function(){return this[t][n].apply(this[t],arguments)})})}function s(e,r,n,o){o.forEach(function(o){o in n.prototype&&(e.prototype[o]=function(){return e=this[r],(n=t(e,o,arguments)).then(function(e){if(e)return new i(e,n.request)});var e,n})})}function a(e){this._index=e}function i(e,t){this._cursor=e,this._request=t}function u(e){this._store=e}function c(e){this._tx=e,this.complete=new Promise(function(t,r){e.oncomplete=function(){t()},e.onerror=function(){r(e.error)},e.onabort=function(){r(e.error)}})}function l(e,t,r){this._db=e,this.oldVersion=t,this.transaction=new c(r)}function d(e){this._db=e}r(a,"_index",["name","keyPath","multiEntry","unique"]),n(a,"_index",IDBIndex,["get","getKey","getAll","getAllKeys","count"]),s(a,"_index",IDBIndex,["openCursor","openKeyCursor"]),r(i,"_cursor",["direction","key","primaryKey","value"]),n(i,"_cursor",IDBCursor,["update","delete"]),["advance","continue","continuePrimaryKey"].forEach(function(t){t in IDBCursor.prototype&&(i.prototype[t]=function(){var r=this,n=arguments;return Promise.resolve().then(function(){return r._cursor[t].apply(r._cursor,n),e(r._request).then(function(e){if(e)return new i(e,r._request)})})})}),u.prototype.createIndex=function(){return new a(this._store.createIndex.apply(this._store,arguments))},u.prototype.index=function(){return new a(this._store.index.apply(this._store,arguments))},r(u,"_store",["name","keyPath","indexNames","autoIncrement"]),n(u,"_store",IDBObjectStore,["put","add","delete","clear","get","getAll","getKey","getAllKeys","count"]),s(u,"_store",IDBObjectStore,["openCursor","openKeyCursor"]),o(u,"_store",IDBObjectStore,["deleteIndex"]),c.prototype.objectStore=function(){return new u(this._tx.objectStore.apply(this._tx,arguments))},r(c,"_tx",["objectStoreNames","mode"]),o(c,"_tx",IDBTransaction,["abort"]),l.prototype.createObjectStore=function(){return new u(this._db.createObjectStore.apply(this._db,arguments))},r(l,"_db",["name","version","objectStoreNames"]),o(l,"_db",IDBDatabase,["deleteObjectStore","close"]),d.prototype.transaction=function(){return new c(this._db.transaction.apply(this._db,arguments))},r(d,"_db",["name","version","objectStoreNames"]),o(d,"_db",IDBDatabase,["close"]),["openCursor","openKeyCursor"].forEach(function(e){[u,a].forEach(function(t){t.prototype[e.replace("open","iterate")]=function(){var t,r=(t=arguments,Array.prototype.slice.call(t)),n=r[r.length-1],o=this._store||this._index,s=o[e].apply(o,r.slice(0,-1));s.onsuccess=function(){n(s.result)}}})}),[a,u].forEach(function(e){e.prototype.getAll||(e.prototype.getAll=function(e,t){var r=this,n=[];return new Promise(function(o){r.iterateCursor(e,function(e){e?(n.push(e.value),void 0===t||n.length!=t?e.continue():o(n)):o(n)})})})});var f={open:function(e,r,n){var o=t(indexedDB,"open",[e,r]),s=o.request;return s.onupgradeneeded=function(e){n&&n(new l(s.result,e.oldVersion,s.transaction))},o.then(function(e){return new d(e)})},delete:function(e){return t(indexedDB,"deleteDatabase",[e])}};"undefined"!=typeof module?(module.exports=f,module.exports.default=module.exports):self.idb=f}(),function(e,t){"object"==typeof exports&&"undefined"!=typeof module?module.exports=t():"function"==typeof define&&define.amd?define(t):e.lozad=t()}(this,function(){"use strict";var e=Object.assign||function(e){for(var t=1;t<arguments.length;t++){var r=arguments[t];for(var n in r)Object.prototype.hasOwnProperty.call(r,n)&&(e[n]=r[n])}return e},t=document.documentMode,r={rootMargin:"0px",threshold:0,load:function(e){if("picture"===e.nodeName.toLowerCase()){var r=document.createElement("img");t&&e.getAttribute("data-iesrc")&&(r.src=e.getAttribute("data-iesrc")),e.appendChild(r)}e.getAttribute("data-src")&&(e.src=e.getAttribute("data-src")),e.getAttribute("data-srcset")&&(e.srcset=e.getAttribute("data-srcset")),e.getAttribute("data-background-image")&&(e.style.backgroundImage="url('"+e.getAttribute("data-background-image")+"')")},loaded:function(){}};function n(e){e.setAttribute("data-loaded",!0)}var o=function(e){return"true"===e.getAttribute("data-loaded")};return function(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:".lozad",s=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},a=e({},r,s),i=a.rootMargin,u=a.threshold,c=a.load,l=a.loaded,d=void 0;return window.IntersectionObserver&&(d=new IntersectionObserver(function(e,t){return function(r,s){r.forEach(function(r){r.intersectionRatio>0&&(s.unobserve(r.target),o(r.target)||(e(r.target),n(r.target),t(r.target)))})}}(c,l),{rootMargin:i,threshold:u})),{observe:function(){for(var e=function(e){return e instanceof Element?[e]:e instanceof NodeList?e:document.querySelectorAll(e)}(t),r=0;r<e.length;r++)o(e[r])||(d?d.observe(e[r]):(c(e[r]),n(e[r]),l(e[r])))},triggerLoad:function(e){o(e)||(c(e),n(e),l(e))}}}});
//# sourceMappingURL=restaurant_list.js.map

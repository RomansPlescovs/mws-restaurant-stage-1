/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/`;
  }

  static get RESTAURANT_URL() {
		return `${this.DATABASE_URL}restaurants/`;
	}

	static get REVIEW_URL() {
		return `${this.DATABASE_URL}reviews/`;
	}

  static get DB_NAME() {
    return 'mws-rr';
  }

  static get RESTAURANT_STORE_NAME() {
    return 'restaurants';
  }

  static get REVIEW_STORE_NAME() {
    return 'reviews';
  }

  static get DB_VER() {
    return 1;
  }

  static getDb() {
    return idb.open(DBHelper.DB_NAME, DBHelper.DB_VER, upgradeDb => {
      const restaurantStore = upgradeDb.createObjectStore(DBHelper.RESTAURANT_STORE_NAME, {
        keyPath: 'id'
      });
      restaurantStore.createIndex('by-id', 'id');
      restaurantStore.createIndex('by-syncStatus', 'syncStatus', {unique: false});


      const reviewStore = upgradeDb.createObjectStore(DBHelper.REVIEW_STORE_NAME, {
        keyPath: 'id', autoIncrement: true 
      });
      reviewStore.createIndex('by-id', 'id');
      reviewStore.createIndex('by-syncStatus', 'syncStatus', {unique: false});
    });
  }

  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants(callback) {
    DBHelper.getDb()
    .then(db => {
      if (!db) return;

      return db
        .transaction(DBHelper.RESTAURANT_STORE_NAME)
        .objectStore(DBHelper.RESTAURANT_STORE_NAME)
        .getAll();
    })
    .then(restaurants => {
      if (restaurants && restaurants.length > 0) {
        return callback(null, restaurants);
      } else {
        fetch(DBHelper.RESTAURANT_URL)
        .then(response => {
          const status = response.status
          if (status !== 200){
            const error = (`Request failed. Returned status of ${status}`);
            return callback(error, null);
          }

          return response.json().then(restaurants => {
            DBHelper.getDb().then(db => {
              if (!db) return;

              const store = db
                .transaction(DBHelper.RESTAURANT_STORE_NAME, 'readwrite')
                .objectStore(DBHelper.RESTAURANT_STORE_NAME);

              restaurants.map(restaurant => {
                if (!restaurant.hasOwnProperty('syncStatus')) 
                  restaurant.syncStatus = 'Success';
                store.put(restaurant)});
            });
            callback(null, restaurants);
          })
        })
        .catch(e => {
          const error = (`Request failed with error: ${e}`);
          callback(error, null);
            
        });
      }
    });
  }


  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    DBHelper.getDb()
    .then(db => {
      if (!db) return;

      return db
        .transaction(DBHelper.RESTAURANT_STORE_NAME)
        .objectStore(DBHelper.RESTAURANT_STORE_NAME)
        .getAll();
    })
    .then(restaurants => {
      restaurant = restaurants.find(restaurant => restaurant.id == id);

      if (restaurant){ 
        return callback(null, restaurant);
      } else {
        fetch(`${DBHelper.RESTAURANT_URL}${id}`)
        .then(response => {
          const status = response.status;
          if (status === 404){
            return callback('Restaurant does not exist', null);
          }

          if (status !== 200){
            return callback('`Request failed. Returned status of ${status}`', null);
          }

          return response.json().then(restaurant => {
            callback(null, restaurant);
          })
        })
        .catch(e => {
          const error = (`Request failed with error: ${e}`);
          callback(error, null);     
        })
      }
    }) 
  }

  static fetchReviewsByRestaurantId(id, callback) {
    DBHelper.getDb()
    .then(db => {
      if (!db) return;

      return db
        .transaction(DBHelper.REVIEW_STORE_NAME)
        .objectStore(DBHelper.REVIEW_STORE_NAME)
        .getAll();

    })
    .then(reviews => {
      reviews = reviews.filter(review => review.restaurant_id === id);

      if (reviews && reviews.length > 0){ 
        return callback(null, reviews);
      } else {
        fetch(`${DBHelper.REVIEW_URL}?restaurant_id=${id}`)
        .then(response => {
          const status = response.status;
          if (status === 404){
            return callback('Restaurant does not exist', null);
          }

          if (status !== 200){
            return callback('`Request failed. Returned status of ${status}`', null);
          }

          return response.json().then(reviews => {
            DBHelper.getDb().then(db => {
              if (!db) return;

              const store = db
                .transaction(DBHelper.REVIEW_STORE_NAME, 'readwrite')
                .objectStore(DBHelper.REVIEW_STORE_NAME);

              reviews.map(review => {
                if (!review.hasOwnProperty('syncStatus')) 
                  review.syncStatus = 'Success';
                store.put(review)
              });
            });
            callback(null, reviews);
          })
        })
        .catch(e => {
          const error = (`Request failed with error: ${e}`);
          callback(error, null);     
        })
      }
    })
  } 

  static createRestaurantReview(review){
    if (!review) return;

    fetch(`${DBHelper.REVIEW_URL}`, {
      method: 'POST',
      body: JSON.stringify(review)
    })
    .then(response =>{
      if (response.status != 201){
        review.syncStatus = 'Pending';
      } else {
        review.syncStatus = 'Success';
      }
      this.createRestaurantReviewDB(review);
    })
    .catch(e =>{
      review.syncStatus = 'Pending';
      DBHelper.createRestaurantReviewDB(review);
    })
  }

  static createRestaurantReviewDB(review) {
    DBHelper.getDb().then(db => {
      if (!db) return;

        const store = db
        .transaction(DBHelper.REVIEW_STORE_NAME, 'readwrite')
        .objectStore(DBHelper.REVIEW_STORE_NAME);

        store.put(review);
      });
  }

  static setFavoriteRestaurant(id, isFavorite){
    if (!id) return;
    fetch(`${DBHelper.RESTAURANT_URL}${id}/?is_favorite=${isFavorite}`, {
      method: 'PUT'
    })
    .then(response =>{
      let syncStatus = 'Pending';
      if (response.status == 200){
        syncStatus = 'Success';
      }
      DBHelper.setFavoriteRestaurantDB(id, isFavorite, syncStatus);
    })
    .catch(e =>{
      DBHelper.setFavoriteRestaurantDB(id, isFavorite, "Pending");
    })
  }

  static setFavoriteRestaurantDB(id, isFavorite, syncStatus){
    DBHelper.getDb().then(db => {
      if (!db) return;

      const index = db
      .transaction(DBHelper.RESTAURANT_STORE_NAME, 'readwrite')
      .objectStore(DBHelper.RESTAURANT_STORE_NAME)
      .index('by-id');

      let keyRangeValue = IDBKeyRange.only(id);
      index.openCursor(keyRangeValue)
      .then(cursor => {
        if (cursor){
          let updateData = cursor.value;
          updateData.is_favorite = isFavorite;
          updateData.syncStatus = syncStatus;
          cursor.update(updateData);
        }
      })
    });
  }

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return restaurant.photograph ? `img/${restaurant.photograph}.webp` : `img/no_image_available.svg`;
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

  static syncRestaurants() {
    console.log("syncRestaurants STARTED");
    DBHelper.getDb().then(db => {
      if (!db) return;

      const index = db
      .transaction(DBHelper.RESTAURANT_STORE_NAME, 'readwrite')
      .objectStore(DBHelper.RESTAURANT_STORE_NAME)
      .index('by-syncStatus');

      let keyRangeValue = IDBKeyRange.only("Pending");
      index.openCursor(keyRangeValue)
      .then(cursor => {
        if (cursor){
          let restaurant = cursor.value;
          if (restaurant) {
            let id = restaurant.id;
            let is_favorite = restaurant.is_favorite;
            DBHelper.setFavoriteRestaurant(id, is_favorite);
          }
        }
      })
    })
  }
  
  static syncReviews() {
    console.log("syncReviews STARTED");
    DBHelper.getDb().then(db => {
      if (!db) return;

      const index = db
      .transaction(DBHelper.REVIEW_STORE_NAME, 'readwrite')
      .objectStore(DBHelper.REVIEW_STORE_NAME)
      .index('by-syncStatus');

      let keyRangeValue = IDBKeyRange.only("Pending");
      index.openCursor(keyRangeValue)
      .then(cursor => {
        if (cursor){
          let review = cursor.value;
          if (review) {
            DBHelper.createRestaurantReview(review);
          }
        }
      })
    })
  }

}

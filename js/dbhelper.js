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
    return `http://localhost:${port}/restaurants`;
  }

  static get DB_NAME() {
    return 'mws-rr';
  }

  static get OBJECT_STORE_NAME() {
    return 'restaurants';
  }

  static get DB_VER() {
    return 1;
  }

  static getDb() {
    return idb.open(DBHelper.DB_NAME, DBHelper.DB_VER, upgradeDb => {
      const objectStore = upgradeDb.createObjectStore(DBHelper.OBJECT_STORE_NAME, {
        keyPath: 'id'
      });

      objectStore.createIndex('by-id', 'id');
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
        .transaction(DBHelper.OBJECT_STORE_NAME)
        .objectStore(DBHelper.OBJECT_STORE_NAME)
        .getAll();
    })
    .then(restaurants => {
      if (restaurants && restaurants.length > 0) {
        return callback(null, restaurants);
      } else {
        fetch(DBHelper.DATABASE_URL)
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
                .transaction(DBHelper.OBJECT_STORE_NAME, 'readwrite')
                .objectStore(DBHelper.OBJECT_STORE_NAME);

              restaurants.map(r => store.put(r));
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
    fetch(`${DBHelper.DATABASE_URL}/${id}`)
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
    return restaurant.photograph ? `/img/${restaurant.photograph}.webp` : `/img/no_image_available.svg`;
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

}

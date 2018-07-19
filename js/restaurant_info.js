let restaurant;
var map;


document.addEventListener('DOMContentLoaded', (event) => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      fillBreadcrumb();
      window.initMap();
    }
  });

});

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {

  if (typeof google !== 'undefined') {
    self.map = new google.maps.Map(document.getElementById('map'), {
      zoom: 16,
      center: restaurant.latlng,
      scrollwheel: false
    });
  }

  DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);

}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }

      fillRestaurantHTML();
      const observer = lozad();
      observer.observe();

      callback(null, restaurant)
    });
  }
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img lozad';
  image.alt = "An image from the restaurant " + restaurant.name;
  image.setAttribute('data-src', DBHelper.imageUrlForRestaurant(restaurant));
  
  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fetch and fill reviews
  fetchAndFillReviews();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fetchAndFillReviews = (reviews = self.restaurant.reviews) => {
  if(!reviews){
    DBHelper.fetchReviewsByRestaurantId(self.restaurant.id, (error, reviews) => {
      self.restaurant.reviews = reviews;
      fillReviewsHTML();  
    })
  } else {
    fillReviewsHTML();
  }
}

fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const header = document.createElement('h4');
  header.classList.add("review-header");
  li.appendChild(header);

  const name = document.createElement('p');
  name.className = 'review-name';
  name.innerHTML = review.name;
  header.appendChild(name);

  const date = document.createElement('p');
  date.className = 'review-date';
  date.innerHTML = new Date(review.createdAt).toLocaleDateString();
  header.appendChild(date);

  const rating = document.createElement('p');
  rating.className = 'review-rating';
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

submitReview = () =>{
  let name = document.getElementById('new-review-name');
  let rating = document.getElementById('new-review-rating');
  let comment = document.getElementById('new-review-comment');
  let reviewRrrorMessage = document.getElementById('review-error-message');
  let errorMessage = "";

  if (!name.value)
    errorMessage += "Please provide your name<br>";
  if (!rating.value)
    errorMessage += "Please provide rating<br>";
  if (!comment.value)
    errorMessage += "Please provide comment<br>";

  if (errorMessage){
    reviewRrrorMessage.innerHTML = errorMessage;
    return;
  }

  review = {
    restaurant_id: self.restaurant.id,
    createdAt: new Date(),
    name: name.value,
    rating: rating.value,
    comments: comment.value
  };

  DBHelper.createRestaurantReview(review);

  name.value = '';
  rating.value = '';
  comment.value = '';

  const ul = document.getElementById('reviews-list');
  ul.appendChild(createReviewHTML(review));

}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
var map;
var accessControl = document.location.href;

// Variables for Travel Time
// GS - '59530f476afdb89ee3907bf314e7d611'
// Bz - '4ff0bccdbf55ab3a48d6c79aef2562e8'
var TRAVEL_TIME_API_KEY = '59530f476afdb89ee3907bf314e7d611';
// GS - '1a8d3c90'
// BZ - '4af91d9e'
var TRAVEL_TIME_APP_ID = '1a8d3c90';
var TOMTOM_API_KEY = 'AhFit0MPeBaiAJcBaFEcJUDHZXcGpeZ7';
var NUMBER_OF_SEARCH_RESULTS = 5;
var renderSearchResultArr = [];

// This will be from an input
var startingLocation = 'Kansas City';
var KC_LAT = '39.0997';
var KC_LON = '-94.5786';
// The departure time in an ISO format.
var departureTime = new Date().toJSON();
//Set userMinutes variable
var userMinutes = 30;
// Travel time in seconds 
var travelTime = 60 * userMinutes; // 30 mins
// Mode of travel
var TRANSPORTATION_TYPE = 'driving';

// jQuery DOM elements
var $searchResultBody = $('#searchResultBody');

// For testing without making API calls
var testArrayCoords = [{ "lat": 38.92685219705572, "lng": -95.1152423261992 }, { "lat": 38.92685219705572, "lng": -95.11753876963212 }, { "lat": 38.92775303136557, "lng": -95.11868699134857 }, { "lat": 38.930455534295106, "lng": -95.1152423261992 }, { "lat": 38.928653865675415, "lng": -95.11294588276628 }, { "lat": 38.928653865675415, "lng": -95.10376010903462 }];


//Initialize floating action button for light and dark mode
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.fixed-action-btn');
  var instances = M.FloatingActionButton.init(elems, {
    direction: 'left',
    hoverEnabled: true
  });
});

//Event Listner for Light/Dark mode
var lightMode = document.getElementById('#lightmode');
var darkMode = document.getElementById('#darkmode');
var mode = "light"
localStorage.setItem('color mode', mode)

$('#lightmode').click(function () {
  if (mode === "dark") {
    mode = "light";
    $('#lightmode').removeClass('dark-mode')
    localStorage.setItem('color mode', mode)
  }
  else {
    mode = "dark";
    $('#lightmode').addClass('dark-mode')
    localStorage.setItem('color mode', mode)
  }
})

$('#darkmode').click(function () {
  if (mode === "light") {
    mode = "dark";
    $('#body').addClass('dark-mode')
    localStorage.setItem('color mode', mode)
  }
  else {
    mode = "light";
    $('#body').removeClass('dark-mode')
    localStorage.setItem('color mode', mode)
  }
})

//Event Listner for Search Button to begin Geocoding Request
$(".btn").click(function () {
  var startingLocation = $('#locationInput').val();
  var userMinutes = parseInt($(self).val());
  console.log(userMinutes);
  sendGeocodingRequest(startingLocation)
})
//Sends the geocoding request.
function sendGeocodingRequest(startingLocation) {
  var request = {
    query: startingLocation,
  }

  var geocodingHeader = {
    'X-Application-Id': TRAVEL_TIME_APP_ID,
    'X-Api-Key': TRAVEL_TIME_API_KEY,
    "Accept-Language": "en-US",
    "focus.lat": KC_LAT,
    "focus.lng": KC_LON,
    "Access-Control-Allow-Origin": accessControl,
  };

  $.ajax({
    url: "http://api.traveltimeapp.com/v4/geocoding/search",
    type: "GET",
    headers: geocodingHeader,
    data: request,
  }).then(sendTimeMapRequest)
};

userMinutes = 30;
// Sends the request for the Time Map multipolygon.
function sendTimeMapRequest(geocodingResponse) {
  console.log('Inside sendTimeMapRequest');
  // The request for Time Map. 
  // Reference: http://docs.traveltimeplatform.com/reference/time-map/
  var coords = geocodingResponse.features[0].geometry.coordinates;
  var latLng = { lat: coords[1], lng: coords[0] };

  var request = {
    departure_searches: [{
      id: "first_location",
      coords: latLng,
      transportation: {
        type: TRANSPORTATION_TYPE,
      },

      departure_time: departureTime,
      travel_time: travelTime
    }],

    arrival_searches: []
  };
  console.log('Post req header: ', request);
  var timeMapHeader = {
    'X-Application-Id': TRAVEL_TIME_APP_ID,
    'X-Api-Key': TRAVEL_TIME_API_KEY,
    "Accept-Language": "en-US",
    "Access-Control-Allow-Origin": accessControl,
  };

  $.ajax({
    url: "https://api.traveltimeapp.com/v4/time-map",
    type: "POST",
    headers: timeMapHeader,
    data: JSON.stringify(request),
    contentType: "application/json; charset=UTF-8",
  }).then(function (res) {
    // Perimeter of time map shape 
    perimeterCoordsArr = res.results[0]['shapes'][0]['shell'];
    // TO DO - TomTom loop function
    searchPerimeter(perimeterCoordsArr);
    console.log(res);
  })
}

// Takes an array of coordinates and returns an array of points of interest
function searchPerimeter(coordArray) {
  renderSearchResultArr = [];
  // Keep adding objects to resultsArr until there are NUMBER_OF_SEARCH_RESULTS
  //while (resultsArr.length < NUMBER_OF_SEARCH_RESULTS) 
  //for (var i = 0; i < NUMBER_OF_SEARCH_RESULTS; i++)
  for (var i = 0; i < NUMBER_OF_SEARCH_RESULTS; i++) {
    // console.log('resultsArr: ', resultsArr);
    // Random number between 0 and array length
    var randomInt = Math.floor(Math.random() * coordArray.length)
    // console.log('randomInt: ', randomInt);
    // lat lon variables for query
    var lat = coordArray[randomInt]['lat'];
    var lon = coordArray[randomInt]['lng'];

    // TomTom fuzzy search
    // https://<baseURL>/search/<versionNumber>/search/<query>.<ext>?
    var searchQuery = 'restaurant';
    var baseURL = 'https://api.tomtom.com/search/2/search/' + searchQuery + '.json?';
    var key = '&key=' + TOMTOM_API_KEY;
    var limit = '&limit=2';
    var lat = '&lat=' + lat;
    var lon = '&lon=' + lon;
    var radius = '&radius=2000';
    var id = '&idx';
    var urlSet = 'Set=POI';
    var category = '&categorySet=7315';
    var openinghours = '&openingHours=nextSevenDays';

    var queryURL = baseURL + key + limit + lat + lon + radius + id + urlSet + category + openinghours;

    $.ajax({
      url: queryURL,
      type: "GET",
    }).then(function (res) {
      // console.log("res: ", res);
      // Object to add to return object {name: '', address: '', rating: ''}
      var tomTomResultObj;
      // If there is a usable response
      if (res['results'][0]) {
        // Make a new, smaller object
        tomTomResultObj = {
          name: res['results'][0]['poi']['name'],
          address: res['results'][0]['address']['freeformAddress'],
          rating: '',
        }
      }

      if (!(renderSearchResultArr[0]) && tomTomResultObj) {
        if (!(renderSearchResultArr.some(function (obj) {
          return obj.name == tomTomResultObj.name
        }))) {
          // Add tomtomObj to renderSearchResultArr
          renderSearchResultArr.push(tomTomResultObj)
        };
      } else if (tomTomResultObj) {
        renderSearchResultArr.push(tomTomResultObj)
      };
      renderSearchResults();
    });
  };
};

var TestResultArr;

function renderSearchResults() {

  $searchResultBody.empty();

  for (var i = 0; i < renderSearchResultArr.length; i++) {
    // console.log('resultarr i -2', resultArr);
    // Initialize result row
    if (renderSearchResultArr[i]) {
      // console.log('renderSearchResultArr i', renderSearchResultArr[i]);
      var $trow = $('<tr>');
      // Populate table data
      var $nameData = $('<td>').text(renderSearchResultArr[i].name);
      var $addressData = $('<td>').text(renderSearchResultArr[i].address);
      var $ratingeData = $('<td>').text(renderSearchResultArr[i].rating);
      // Append data to row
      $trow.append($nameData, $addressData, $ratingeData);
      // Append row to table
      $searchResultBody.append($trow);
    };
  };
};

// Get user location data 
function getBrowserLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
  } else {
    console.log("Get Browser Location error");
  };
};

// Handler for location data
function showPosition(position) {
  // User latitude
  KC_LAT = position.coords.latitude;

  // User longtude
  KC_LON = position.coords.longitude;

};
getBrowserLocation();

// Googe Maps API
function initMap() {
  var mapOpts = {
    center: new google.maps.LatLng(KC_LAT, KC_LON),
    zoom: 13,
  };

  map = new google.maps.Map(document.getElementById('discomfortMap'), mapOpts);
  var location0 = new google.maps.Marker({
    position: new google.maps.LatLng(KC_LAT, KC_LON),
    map: map,
    title: 'Kansas City',
    animation: google.maps.Animation.DROP
  });

  if (!google.maps.Polygon.prototype.getBounds) {
    google.maps.Polygon.prototype.getBounds = function () {
      var bounds = new google.maps.LatLngBounds();
      var paths = this.getPaths();
      var path;
      for (var i = 0; i < paths.getLength(); i++) {
        path = paths.getAt(i);
        for (var ii = 0; ii < path.getLength(); ii++) {
          bounds.extend(path.getAt(ii));
        }
      }
      return bounds;
    }
  }
  // sendGeocodingRequest(startingLocation);
}


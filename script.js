var map;
var accessControl = document.location.href;

// Variables for Travel Time
var TRAVEL_TIME_API_KEY = '4ff0bccdbf55ab3a48d6c79aef2562e8';
var TRAVEL_TIME_APP_ID = '4af91d9e';
var TOMTOM_API_KEY = 'AhFit0MPeBaiAJcBaFEcJUDHZXcGpeZ7';


// This will be from an input
var startingLocation = "Kansas City"
var KC_LAT = "39.0997";
var KC_LON = "-94.5786";
// The departure time in an ISO format.
var departureTime = new Date().toJSON();
// Travel time in seconds 
var travelTime = 60 * 30; // 30 mins
// Mode of travel
var TRANSPORTATION_TYPE = 'driving';

// For testing without making API calls
// var testArrayCoords = [{ "lat": 38.92685219705572, "lng": -95.1152423261992 }, { "lat": 38.92685219705572, "lng": -95.11753876963212 }, { "lat": 38.92775303136557, "lng": -95.11868699134857 }, { "lat": 38.930455534295106, "lng": -95.1152423261992 }, { "lat": 38.928653865675415, "lng": -95.11294588276628 }, { "lat": 38.928653865675415, "lng": -95.10376010903462 }];


//Initialize floating action button for light and dark mode
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('.fixed-action-btn');
  var instances = M.FloatingActionButton.init(elems, {
    direction: 'left',
    hoverEnabled: true,
  });
});


//On Click function to activate light and dark mode
$('#darkmode').click(function () {
  var element = document.body;
  element.classList.toggle("dark-mode");
})

// $('#lightmode').click(function () {
//   if 
// })

// //Initialize dropdown menu for Travel Time
var instance = M.FormSelect.getInstance(elems);
document.addEventListener('DOMContentLoaded', function () {
  var elems = document.querySelectorAll('select');
  instances = M.FormSelect.init(elems,
    autoTrigger, true,
    closeOnClick, true,
    hover, true,
    constrainWidth, true,
  );
});
//Event Listner for Search Button to begin Geocoding Request
$("#searchbutton").click(function () {

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

  // Sends the request for the Time Map multipolygon.
  function sendTimeMapRequest(geocodingResponse) {
    // The request for Time Map. 
    // Reference: http://docs.traveltimeplatform.com/reference/time-map/
    var coords = geocodingResponse.features[0].geometry.coordinates;
    var latLng = { lat: coords[1], lng: coords[0] };

    var request = {
      departure_searches: [{
        id: "first_location",
        coords: latLng,
        transportation: {
          type: TRANSPORTATION_TYPE
        },

        departure_time: departureTime,
        travel_time: travelTime
      }],

      arrival_searches: []
    };

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
      console.log(res);
    })
  }

  function searchPerimeter(coordArray) {

    resultsArr = [];

    // Change this to while resultsArr.length <10
    for (var i = 0; i < 10; i++) {
      // Random number between 0 and array length
      var randomInt = Math.floor(Math.random() * coordArray.length)

      // lat lon variables from 
      var lat = coordArray[randomInt]['lat'];
      var lon = coordArray[randomInt]['lng'];

      // console.log("lat: " + lat);
      // console.log("lon: " + lon);
      tomTomFuzzyQuery(lat, lon);
      // If this is a unique result
    }

  }

  function tomTomFuzzyQuery(latIn, lonIn) {
    // https://<baseURL>/search/<versionNumber>/search/<query>.<ext>?
    var searchQuery = 'restaurant';
    var baseURL = 'https://api.tomtom.com/search/2/search/' + searchQuery + '.json?';
    var key = '&key=' + TOMTOM_API_KEY;
    var limit = '&limit=2';
    var lat = '&lat=' + latIn;
    var lon = '&lon=' + lonIn;
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
      console.log(res);
    });
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
    userLat = position.coords.latitude;
    console.log("browser lat: " + position.coords.latitude);
    // User longtude
    userLong = position.coords.longitude;
    console.log("browser long: " + position.coords.longitude);
  };

  // Googe Maps API
  function initMap() {
    var mapOpts = {
      center: { lat: KC_LAT, lng: KC_LON },
      zoom: 13,
    };

    map = new google.maps.Map(document.getElementById('discomfortMap'), mapOpts);
    // Is this copied from somewhere? Where do lat/lon come from?
    var location0 = new google.maps.Marker({
      position: { lat: KC_LAT, lng: KC_LON },
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
    sendGeocodingRequest(startingLocation);
  }
})
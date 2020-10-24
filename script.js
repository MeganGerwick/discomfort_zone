// The name of the starting location. We will have to geocode this to coordinates.
var startingLocation = "London Waterloo Station";
// The departure time in an ISO format.
var departureTime = new Date().toJSON();
// Travel time in seconds. We want 15 minutes travel time so it is 15 minutes x 60 seconds.
var travelTime = 60 * 15;
// These secret variables are needed to authenticate the request. Get them from http://docs.traveltimeplatform.com/overview/getting-keys/ and replace 

// var APPLICATION_ID = travelTimeAppID;
// var API_KEY = travelTimeAPIKey;
var accessControl = document.location.href
console.log(window.location.href)
console.log(document.location.href)

//Initialize floating action button for light and dark mode
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.fixed-action-btn');
    // M. has something to do with materialize
    var instances = M.FloatingActionButton.init(elems, {
        direction: 'left'
    });
  });

//Initialize dropdown menu for mode of transport
var instance = M.FormSelect.getInstance(elem);
document.addEventListener('DOMContentLoaded', function() {
    var elems = document.querySelectorAll('select');
    var instances = M.FormSelect.init(elems, options);
  });
//Button Click handler
//ajax call to apis
//BZ's
// var travelTimeAppID = 'd79f2509';
// var travelTimeAPIKey = 'd91d9d1769d69892e29274e1ed792097';

// GS's
// var travelTimeAppID = '1a8d3c90';
// var travelTimeAPIKey = '59530f476afdb89ee3907bf314e7d611';

//BZ's new api key
var travelTimeAppID = "4af91d9e";
var travelTimeAPIKey = "4ff0bccdbf55ab3a48d6c79aef2562e8";

//KCMO Coordinates: 39.0997° N, -94.5786° W
//Practicing Google  Map API call Line 19-24
var discomfortMap;
function initMap() {
    var mapOpts = {
        center: { lat: 39.0997, lng: -94.5786 },
        zoom: 8,
    };
    discomfortMap = new google.maps.Map(document.getElementById('discomfortMap'), mapOpts);
    var location0 = new google.maps.Marker({
        position: { lat: 39.0997, lng: -94.5786 },
        map: discomfortMap,
        title: 'Kansas City: Crown Town',
        animation: google.maps.Animation.DROP
    });
};



//Render map
//Render search results
//Add clickable results to webpage or copy address (if everything else is done)

//Dark and Light mode in local storage
var userLat = 39.0997;
var userLong = -94.5786;

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

getBrowserLocation();
// "Working" API calls 

var map;
// Googe Maps API
function initMap() {
    var mapOpts = {
        center: { lat: 39.0997, lng: -94.5786 },
        zoom: 13,
    };

    map = new google.maps.Map(document.getElementById('discomfortMap'), mapOpts);

    var marker0 = new google.maps.Marker({
        position: { lat: 51.5031653, lng: -0.1123051 },
        map: map,
        title: 'London Waterloo train station',
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
    console.log("Starting location: " + startingLocation);
    sendGeocodingRequest(startingLocation);
}



// Sends the geocoding request.
// function sendGeocodingRequest(startingLocation) {
//     console.log('sendGeo started');
//     var request = {
//         query: startingLocation,
//     }

//     var header = {
//         'X-Application-Id': "4af91d9e",
//         'X-Api-Key': "4ff0bccdbf55ab3a48d6c79aef2562e8",
//         "Accept-Language": "en-US",
//         "Access-Control-Allow-Origin": accessControl,
//     };

//     $.ajax({
//         url: "http://api.traveltimeapp.com/v4/geocoding/search",
//         type: "GET",
//         headers: header,
//         data: request,
//     }).then(sendTimeMapRequest)
// };

// Sends the request of the Time Map multipolygon.
function sendTimeMapRequest(geocodingResponse) {
    console.log('inside sendTimeMapRequest');
    // The request for Time Map. Reference: http://docs.traveltimeplatform.com/reference/time-map/
    var coords = geocodingResponse.features[0].geometry.coordinates;
    var latLng = { lat: coords[1], lng: coords[0] };

    var request = {
        departure_searches: [{
            id: "first_location",
            coords: latLng,
            transportation: {
                // Task - Get this from user 
                type: "public_transport"
            },

            departure_time: departureTime,
            travel_time: travelTime
        }],

        arrival_searches: []
    };

    var header = {
        'X-Application-Id': "4af91d9e",
        'X-Api-Key': "4ff0bccdbf55ab3a48d6c79aef2562e8",
        "Accept-Language": "en-US",
        "Access-Control-Allow-Origin": accessControl,
    };

    $.ajax({
        url: "https://api.traveltimeapp.com/v4/time-map",
        type: "POST",
        headers: header,
        data: JSON.stringify(request),
        contentType: "application/json; charset=UTF-8",
    }).then(drawTimeMap)

    // Draws the resulting multipolygon from the response on the map.
    function drawTimeMap(response) {
        console.log(response);
        // Reference for the response: http://docs.traveltimeplatform.com/reference/time-map/#response-body-json-attributes

        var paths = response.results[0].shapes.map(function (polygon) {
            var shell = polygon.shell
            var holes = polygon.holes
            return [shell].concat(holes);
        }).map(x => x[0]);

        var polygon = new google.maps.Polygon({
            paths,
            strokeColor: "#F5A623",
            strokeOpacity: 1,
            strokeWeight: 5,
            fillColor: "#46461F",
            fillOpacity: 0.25
        });
        polygon.setMap(map);
        map.fitBounds(polygon.getBounds())

        // var header = {
        //     'X-Application-Id': travelTimeAppID,
        //     'X-Api-Key': travelTimeAPIKey,
        //     "Accept-Language": "en-US",
        //     "Access-Control-Allow-Origin": accessControl
        // };

        // $.ajax({
        //     url: "http://api.traveltimeapp.com/v4/geocoding/search",
        //     type: "GET",
        //     headers: header,
        //     data: request,
        // }).then(sendTimeMapRequest)

        // // Draws the resulting multipolygon from the response on the map.
        // function drawTimeMap(response) {

        //     // Reference for the response: http://docs.traveltimeplatform.com/reference/time-map/#response-body-json-attributes

        //     var paths = response.results[0].shapes.map(function (polygon) {
        //         var shell = polygon.shell
        //         var holes = polygon.holes
        //         return [shell].concat(holes);
        //     }).map(x => x[0]);

        //     var polygon = new google.maps.Polygon({
        //         paths,
        //         strokeColor: "#F5A623",
        //         strokeOpacity: 1,
        //         strokeWeight: 5,
        //         fillColor: "#46461F",
        //         fillOpacity: 0.25
        //     });
        //     polygon.setMap(map);
        //     map.fitBounds(polygon.getBounds())

        };
    }
// };

var exampleLatLongArray =  [
    {
      "shell": [
        {
          "lat": 51.516246,
          "lng": -0.14439687999999948
        },
        {
          "lat": 51.51714528,
          "lng": -0.14349759999999945
        },
        {
          "lat": 51.51804456,
          "lng": -0.14349759999999945
        },
        {
          "lat": 51.5184942,
          "lng": -0.14304795999999942
        },
        {
          "lat": 51.51714528,
          "lng": -0.1416990399999994
        },
        {
          "lat": 51.516246,
          "lng": -0.1416990399999994
        },
        {
          "lat": 51.51489708,
          "lng": -0.14035011999999936
        },
        {
          "lat": 51.515796359999996,
          "lng": -0.13945083999999933
        },
        {
          "lat": 51.515796359999996,
          "lng": -0.1385515599999993
        },
        {
          "lat": 51.51534672,
          "lng": -0.13810191999999927
        },
        {
          "lat": 51.51444744,
          "lng": -0.13810191999999927
        },
        {
          "lat": 51.5139978,
          "lng": -0.13765227999999927
        },
        {
          "lat": 51.51669564,
          "lng": -0.13495443999999918
        },
        {
          "lat": 51.51669564,
          "lng": -0.13315587999999912
        },
        {
          "lat": 51.51714528,
          "lng": -0.13270623999999911
        },
        {
          "lat": 51.51804456,
          "lng": -0.13360551999999914
        },
        {
          "lat": 51.51984312,
          "lng": -0.13360551999999914
        },
        {
          "lat": 51.52029276,
          "lng": -0.13315587999999912
        },
        {
          "lat": 51.52029276,
          "lng": -0.13225659999999909
        }]
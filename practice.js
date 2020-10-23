
// // Sends the geocoding request.
// function sendGeocodingRequest(location) {
//     // The request for the geocoder. Reference: http://docs.traveltimeplatform.com/reference/geocoding-search/
//     var request = {
//         query: location
//     };
//     var xhr = new XMLHttpRequest();
//     xhr.responseType = "json";
//     xhr.open("GET", "https://api.traveltimeapp.com/v4/geocoding/search?query=" + location)
//     xhr.setRequestHeader("X-Application-Id", APPLICATION_ID);
//     xhr.setRequestHeader("X-Api-Key", API_KEY);
//     xhr.setRequestHeader("Accept-Language", " en-US");
//     xhr.onreadystatechange = function () {
//         if (xhr.status >= 200 && xhr.status < 300) {
//             if (xhr.readyState === 4) {
//                 console.log(xhr.response);
//                 sendTimeMapRequest(xhr.response)
//             }
//         } else {
//             console.error("Check your login")
//         }
//     };
//     xhr.send();
// };

// var startingLocation = "London";

// var map;
// function initMap() {
//     var mapOpts = {
//         center: { lat: 51.5031653, lng: -0.1123051 },
//         zoom: 13,
//     };

//     map = new google.maps.Map(document.getElementById('map'), mapOpts);

//     var marker0 = new google.maps.Marker({
//         position: { lat: 51.5031653, lng: -0.1123051 },
//         map: map,
//         title: 'London Waterloo train station',
//         animation: google.maps.Animation.DROP
//     });

//     if (!google.maps.Polygon.prototype.getBounds) {
//         google.maps.Polygon.prototype.getBounds = function () {
//             var bounds = new google.maps.LatLngBounds();
//             var paths = this.getPaths();
//             var path;
//             for (var i = 0; i < paths.getLength(); i++) {
//                 path = paths.getAt(i);
//                 for (var ii = 0; ii < path.getLength(); ii++) {
//                     bounds.extend(path.getAt(ii));
//                 }
//             }
//             return bounds;
//         }
//     }

//     sendGeocodingRequest(startingLocation);
// }

////// REPLACE GEOCODING FUNCTION
// function sendGeocodingRequest(startingLocation) {

//     var queryURL = 'https://api.traveltimeapp.com/v4/geocoding/search?query=' + startingLocation;

//     var header = {
//         'X-Application-Id': '1a8d3c90',
//         'X-Api-Key': '59530f476afdb89ee3907bf314e7d611',
//         "Accept-Language": "en-US",
//         "Access-Control-Allow-Origin": "127.0.0.1"
//     };

//     $.ajax({
//         type: "GET",
//         url: queryURL,
//         header: header,
//         dataType: 'JSON',
//     }).then(function (res) {
//         console.log(res);
//     });
// };


var map;
function initMap() {
    var mapOpts = {
        center: { lat: 51.5031653, lng: -0.1123051 },
        zoom: 13,
    };

    map = new google.maps.Map(document.getElementById('map'), mapOpts);

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
    console.log(startingLocation);
    sendGeocodingRequest(startingLocation);
}

// The name of the starting location. We will have to geocode this to coordinates.
var startingLocation = "London Waterloo Station";
// The departure time in an ISO format.
var departureTime = new Date().toJSON();
// Travel time in seconds. We want 15 minutes travel time so it is 15 minutes x 60 seconds.
var travelTime = 60 * 15;
// These secret variables are needed to authenticate the request. Get them from http://docs.traveltimeplatform.com/overview/getting-keys/ and replace 
var travelTimeAppID = 'd79f2509';
var travelTimeAPIKey = 'd91d9d1769d69892e29274e1ed792097';

var APPLICATION_ID = travelTimeAppID;
var API_KEY = travelTimeAPIKey;


// Sends the geocoding request.
function sendGeocodingRequest(startingLocation) {
    console.log('sendGeo started');
    var request = {
        query: startingLocation,
    }

    var header = {
        'X-Application-Id': travelTimeAppID,
        'X-Api-Key': travelTimeAPIKey,
        "Accept-Language": "en-US",
        "Access-Control-Allow-Origin": "127.0.0.1"
    };

    $.ajax({
        url: "http://api.traveltimeapp.com/v4/geocoding/search",
        type: "GET",
        headers: header,
        data: request,
    }).then(sendTimeMapRequest);
}

function success(data) {
            console.log('I work');
        };

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
                    type: "public_transport" //Comes from input
                },

                departure_time: departureTime,
                travel_time: travelTime
            }],

            arrival_searches: []
        };

        var xhr = new XMLHttpRequest()
        //.then in ajax
        xhr.addEventListener("readystatechange", function () {
            if (this.readyState === 4) {
                //console.log(this.response);
                drawTimeMap(this.response);
            }
        });
        xhr.open("POST", "https://api.traveltimeapp.com/v4/time-map")
        xhr.setRequestHeader("X-Application-Id", APPLICATION_ID);
        xhr.setRequestHeader("X-Api-Key", API_KEY);
        xhr.setRequestHeader("Content-Type", "application/json; charset=UTF-8");
        xhr.responseType = "json";
        xhr.send(JSON.stringify(request));

        var request = {
            query: startingLocation,
        }

        var header = {
            'X-Application-Id': travelTimeAppID,
            'X-Api-Key': travelTimeAPIKey,
            "Accept-Language": "en-US",
            "Access-Control-Allow-Origin": "127.0.0.1"
        };

        $.ajax({
            url: "http://api.traveltimeapp.com/v4/geocoding/search",
            type: "GET",
            headers: header,
            data: request,
        }).then(sendTimeMapRequest)

        // Draws the resulting multipolygon from the response on the map.
        function drawTimeMap(response) {

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

        };
    }

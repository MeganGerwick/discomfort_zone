//Initialize floating action button for light and dark mode
document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.fixed-action-btn');
    var instances = M.FloatingActionButton.init(elems, {
        direction: 'left'
    });
});


//Button Click handler
//ajax call to apis

// function getAjax(params) {
//     console.log("I work");
// }


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
}



//Render map
//Render search results
//Add clickable results to webpage or copy address (if everything else is done)

//Dark and Light mode in local storage
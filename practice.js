
            function initialize() {
                var mapProp = {
                    center: new google.maps.LatLng(51.508742, -0.120850),
                    zoom: 5,
                    mapTypeId: google.maps.MapTypeId.ROADMAP
                };
                var map = new google.maps.Map(document.getElementById("googleMap"), mapProp);
                var map2 = new google.maps.Map(document.getElementById("googleMap2"), mapProp);
            }
            google.maps.event.addDomListener(window, 'load', initialize);

            $(document).ready(function () {
              //MAKE SURE YOU CALL .leanModal METHOD THIS WAY.
              //ELSE MODAL MAP WILL NOT SHOW PROPERLY.
                $('.modal-trigger').leanModal({
                    ready: function () {
                        var map2 = document.getElementById("googleMap2");
                        google.maps.event.trigger(map2, 'resize');
                    }
                });
            });
        

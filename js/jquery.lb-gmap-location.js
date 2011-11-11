/**
 * Simple implementation to grab a location's coordinates using the GMaps v3 api
 *
 * v 1.0
 *
 * works with an input[type=text]
 * a hidden field should be added, named as the input field with "-coordinates" appended
 * if the hidden field is not present it will automagically be added
 *
 * Use $('#element').lbGMapLocation()
 *
 */
(function($) {

    $.fn.lbGmapLocation = function(options) {

        var defaults = {
            showMap         : true,
            mapTypes        : [],
            defaultMapZoom  : 17,
            mapClass        : 'map-container'
        }

        var $input  = this;
        var $map    = false;
        var $mapBox = false;
        var $lbCoordinates = $input.closest('form, body').find('input[type="hidden"][name="' + $input.attr('name') + '-coordinates"]').eq(0);

        var $Gmap   = false;
        var $Gmarker= false;
        var autocomplete = false;

        $input.settings = {}

        /**
         * Sets up Gmaps V3 autocomplete to an input field
         *
         */
        var init = function() {
            $input.settings = $.extend({}, defaults, options);
            
            $input.keydown(function(e) {
                // stop form submission on pressing enter
                var keycode = false;

                if (e == null)  // ie 
                    keycode = event.keyCode; 
                else
                    keycode = e.which; 
                
                if( keycode == 13) { e.preventDefault(); }
            });

            // if there is no hidden field for the coordinates, set it up
            if( !$lbCoordinates.length )
                $lbCoordinates = $('<input type="hidden" name="' + $input.attr('name') + '-coordinates" />').insertAfter($input)

            autocomplete = new google.maps.places.Autocomplete($input[0], { types :  $input.settings.mapTypes });
            google.maps.event.addListener(autocomplete, 'place_changed', callback);

            setUpMap();
        }


        /**
         * Autocomplete callback
         * sets the coordinates in the hidden field
         * sets the new text in the input field
         * updates the map position if there's a map
         * @param  : nothing is sent
         * @return : nothing is returned
         *
         */
        var callback = function(a,b) {
            var place = autocomplete.getPlace();

            var address = '';

            if (place.address_components) {
                address = [(place.address_components[0] &&
                place.address_components[0].short_name || ''),
                (place.address_components[1] &&
                place.address_components[1].short_name || ''),
                (place.address_components[2] &&
                place.address_components[2].short_name || '')
                ].join(' ');
            }

            $lbCoordinates.val(place.geometry.location);

            if( $input.settings.showMap ) {
                // if showing map update it
                if (place.geometry.viewport) {
                    $Gmap.fitBounds(place.geometry.viewport);
                } else {
                    $Gmap.setCenter(place.geometry.location);
                    $Gmap.setZoom($input.settings.defaultMapZoom);
                }

                $Gmarker.setPosition(place.geometry.location);
            }
        }

        /**
         * Set up the Interactive Map if we want one
         * @param  : nothing is sent
         * @return : nothing is returned
         *
         */
        var setUpMap = function() {
            if( $input.settings.showMap ) {

                var iCoords = getCoords();
                var coords  = new google.maps.LatLng(iCoords[0], iCoords[1])
                var mapOptions = {
                    center              : coords,
                    zoom                : 13,
                    disableDefaultUI    : true,
                    zoomControl         : true,
                    mapTypeId           : google.maps.MapTypeId.ROADMAP,
                    disableDoubleClickZoom : true,
                    draggable           : false,
                    scrollwheel         : false
                };

                $map = $('<div class="' + $input.settings.mapClass + '"></div>').insertAfter($input);
                $map.css({ height : '150px', width : '150px' });

                $mapBox = $map[0];

                $Gmap = new google.maps.Map($mapBox, mapOptions);

                $Gmarker = new google.maps.Marker({
                    map     : $Gmap
                });

                $Gmarker.setPosition(coords);
            }
        }

        /**
         * Get the string of coordinates from the hidden coords field
         * @param  : nothing is sent
         * @return : array [lat, lon] is returned
         *
         */
        var getCoords = function() {
            var lat = 51.5001524;
            var lon = -0.12623619999999391;

            if( $lbCoordinates.length && $lbCoordinates.val() != '' ) {
                var coords = $lbCoordinates.val().replace(/\(/, '').replace(/\)/, '').split(',');
            
                if( coords.length > 1 ) {
                    lat = coords[0];
                    lon = coords[1];
                }
            }
            
            return [lat, lon];
        }

        init();

    }
})(jQuery);
/**
 *  Flashbit's geolocation test library
 *
 *  Deploys Google Maps API and its revers geocoding
 *
 *  Copyright � 2010 Flashbit LLC. All rights reserved.
 */

var coords;
var $error = $("<p class='error'></p>");
var $loader = $("<div id='loader'></div>");

var showCoords = function(position) {
    coords = position.coords.latitude + "," + position.coords.longitude;
    getReverseGeoCode();
};

var getMyLocation = function() {
    if (navigator.geolocation) {
        var geolocDone = navigator.geolocation.getCurrentPosition(showCoords, geolocFailed);
    } else {
        throwError("Geolocation not available on this platform!");
    }
};

var geolocFailed = function() {
    throwError("Failed to retrieve current position on this platform!");
};

var throwError = function(value) {
    $loader.remove();
    $("h1").after($error.append(value));
};

var displayLoader = function() {
    $("h1").after($loader);
};

var getReverseGeoCode = function() {
    geocoder = new GClientGeocoder();
    geocoder.getLocations(coords, function(addresses) {
        if (addresses.Status.code != 200) {
            throwError("Reverse geocoder failed to find an address for " + coords);
        } else {
            address = addresses.Placemark[0];
            $loader.remove();
            $("h1").after("<p>Your address is <strong>"+address.address+"</strong> ("+coords+").</p><p><a href='http://maps.google.com/?q="+coords+"'>Click here for your location on map</a></p>");
        }
    });
};

$(document).ready(function() {
    displayLoader();
    getMyLocation();
});
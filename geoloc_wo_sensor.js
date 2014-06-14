/**
 *  Flashbit's geolocation test library
 *
 *  Copyright © 2010 Flashbit LLC. All rights reserved.
 */

var coords;

var showCoords = function(position) {
    coords = position.coords.latitude + "," + position.coords.longitude;
    addLink();
    getReverseGeoCode();
}

var getMyLocation = function() {
    /*if (navigator.geolocation) {
        displayLoader();
        navigator.geolocation.getCurrentPosition(showCoords);
    } else {
      */  coords = "40.714224,-73.961452";
        addLink();
        getReverseGeoCode();
        //throwError();
    //}
}

var throwError = function(value) {
    $("p").text(value).addClass("error");
};

var displayLoader = function() {

};

var addLink = function() {
    $("h1").after("<p>Your coordinates are "+coords+"</p><p><a href='http://maps.google.com/?q="+coords+"'>Click here for your location on map</a></p>");
};

var getReverseGeoCode = function() {

    geocoder = new GClientGeocoder();

    geocoder.getLocations(coords, function(addresses) {
          if(addresses.Status.code != 200) {
            alert("reverse geocoder failed to find an address for " + latlng.toUrlValue());
          }
          else {
            address = addresses.Placemark[0];
            console.log("Address is "+address.address);
          }
    });

   /* var reverseGeocodeServiceURL = "http://maps.google.com/maps/api/geocode/json?latlng="+coords+"&sensor=false";
    $.get(reverseGeocodeServiceURL, function(data) {
        alert("Data received! "+data.status);
    });*/
};

$(document).ready(function() {
    getMyLocation();
});
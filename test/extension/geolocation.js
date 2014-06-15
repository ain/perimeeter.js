/*! perimeeter.js - v0.0.1 - 2014-06-15
 * Mock class for HTML5 Geolocation API
 * https://github.com/ain/perimeeter.js
 * Copyright © 2014 Ain Tohvri; Licensed GPL */

/* exported Geolocation */
var Geolocation = (function() {

  'use strict';

  var defaults = {
    latitude: '53.581184',
    longitude: '9.946937'
  };

  function Geolocation(latitude, longitude) {
    this.latitude = latitude || defaults.latitude;
    this.longitude = longitude || defaults.longitude;
    var self = this;
    window.navigator.geolocation =
    {
      getCurrentPosition: function(callback) {
        callback({ coords: { latitude: self.latitude, longitude: self.longitude } });
      }
    };
  }

  return Geolocation;
})();

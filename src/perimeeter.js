/*! perimeeter.js - v0.0.1 - 2014-06-14
 * https://github.com/ain/perimeeter.js
 * Copyright © 2014 Ain Tohvri; Licensed GPL */

/* exported Perimeeter */
/* global navigator */
/* global google */
/* global signals */
var Perimeeter = (function() {

  'use strict';

  var Signal = signals.Signal,
    coords = null,
    defaults = {
      radius: 0,
      maxResults: 1,
      capabilityDetection: false
    },
    signalCollection = {
      positioned: null,
      located: null
    },
    geocoder;

  function parseRadius(radius) {
    var parsedRadius = parseFloat(radius);
    if (/^\d+(\.\d+)?$/.test(parsedRadius)) {
      return parsedRadius;
    }
    throw new TypeError('Invalid option for radius! Number expected.');
  }

  function parseMaxResults(value) {
    var parsedMaxResults = parseFloat(value);
    if (/^\d+$/.test(parsedMaxResults)) {
      return parsedMaxResults;
    }
    throw new TypeError('Invalid option for max. results! Number expected.');
  }

  function degreesToRadians(d) {
    return d * (Math.PI/180);
  }

  function radiansToDegrees(r) {
    return r * (180/Math.PI);
  }

  function normalizeLongitude(lng) {
    if (lng > Math.PI) {
      lng -= 2 * Math.PI;
    }
    else if (lng < -1 * Math.PI) {
      lng += 2 * Math.PI;
    }
    return lng;
  }

  function parseOption(option, value) {
    if (option === 'radius') {
      return parseRadius(value);
    }
    else if (option === 'maxResults') {
      return parseMaxResults(value);
    }
    return value;
  }

  function parseOptions(options) {
    if (typeof options !== 'object') {
      throw new TypeError('Invalid format for options! Object expected.');
    }
    var parsedOptions = defaults;
    for (var option in defaults) {
      if (options[option] !== undefined) {
        parsedOptions[option] = parseOption(option, options[option]);
      }
    }
    return parsedOptions;
  }

  function addSignals() {
    signalCollection.positioned = new Signal();
    signalCollection.located = new Signal();
  }

  function getGeocoderRequest(coords) {
    var request = {
      'latLng': new google.maps.LatLng(coords.latitude, coords.longitude)
    };
    return request;
  }

  function handleCurrentPositionSuccess(position) {
    coords = position.coords;
    signalCollection.positioned.dispatch(coords);
  }

  function handleCurrentPositionFailure() {
    var error = new Error('Failed to get current position!');
    signalCollection.positioned.dispatch(error);
    throw error;
  }

  function handleGeocoderResult(results, status) {
    signalCollection.located.dispatch({geocoderResults: results, geocoderStatus: status});
  }

  function Perimeeter(options) {
    this.options = options ? parseOptions(options) : defaults;
    addSignals();
  }

  Perimeeter.prototype.getSignals = function() {
    return signalCollection;
  };

  Perimeeter.prototype.getRadius = function() {
    return this.options.radius;
  };

  Perimeeter.prototype.getMaxResults = function() {
    return this.options.maxResults;
  };

  Perimeeter.prototype.getCoordinates = function() {
    return coords;
  };

  Perimeeter.prototype.position = function() {
    navigator.geolocation.getCurrentPosition(handleCurrentPositionSuccess, handleCurrentPositionFailure);
  };

  Perimeeter.prototype.getAddress = function() {
    var request = getGeocoderRequest(coords);
    geocoder = new google.maps.Geocoder();
    geocoder.geocode(request, handleGeocoderResult);
  };

  // Queue gecoding requests to avoid OVER_QUERY_LIMIT error
  function queueAddressGeocode(coords) {
    var request = getGeocoderRequest(coords);
    setTimeout(function(){
      geocoder.geocode(request, handleGeocoderResult);
    }, 2000);
  }

  Perimeeter.prototype.getNearbyAddresses = function() {
    if ( typeof coords !== 'object' ) {
      throw new Error('Failed to get current position.');
    }

    var lat = degreesToRadians(coords.latitude),
      lng = degreesToRadians(coords.longitude),
      // Mean km radius of Earth. Use 3960.056052 for miles
      earthRadius = 6372.796924,
      maxDistance = this.getRadius()/earthRadius,
      randomDistance, bearing,
      newLat, newLng,
      i, location, locations = [];

    for ( i = 0; i < this.getMaxResults(); i++ ) {
      randomDistance = Math.acos((Math.random() * (Math.cos(maxDistance) - 1 )) + 1);
      bearing = Math.PI * 2 * Math.random();
      newLat = Math.asin((Math.sin(lat) * Math.cos(randomDistance)) + (Math.cos(lat) * Math.sin(randomDistance) * Math.cos(bearing)));
      newLng = normalizeLongitude(lng + Math.atan2(Math.sin(bearing) * Math.sin(randomDistance) * Math.cos(lat), Math.cos(randomDistance) - Math.sin(lat) * Math.sin(newLat)));
      location = {
        'latitude': radiansToDegrees(newLat),
        'longitude': radiansToDegrees(newLng)
      };
      locations.push(location);
      queueAddressGeocode(location);
    }

    return locations;
  };

  Perimeeter.isCapablePlatform = function() {
    return 'geolocation' in navigator;
  };

  return Perimeeter;

})();
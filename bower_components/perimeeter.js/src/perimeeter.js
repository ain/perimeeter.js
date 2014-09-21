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
    nearbyCoords = null,
    defaults = {
      radius: 0,
      maxResults: 1,
      capabilityDetection: false,
      distanceUnit: 'km'
    },
    parsedOptions,
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

  function calculateNearbyCoordinates() {
    var lat = degreesToRadians(coords.latitude),
      lng = degreesToRadians(coords.longitude),
      earthRadius = (parsedOptions.distanceUnit === 'mi') ? 3960.056052 : 6372.796924,
      maxDistance = parsedOptions.radius/earthRadius,
      randomDistance, bearing,
      newLat, newLng,
      i;

    nearbyCoords = [];

    for ( i = 0; i < parsedOptions.maxResults; i++ ) {
      randomDistance = Math.acos((Math.random() * (Math.cos(maxDistance) - 1 )) + 1);
      bearing = Math.PI * 2 * Math.random();
      newLat = Math.asin((Math.sin(lat) * Math.cos(randomDistance)) + (Math.cos(lat) * Math.sin(randomDistance) * Math.cos(bearing)));
      newLng = normalizeLongitude(lng + Math.atan2(Math.sin(bearing) * Math.sin(randomDistance) * Math.cos(lat), Math.cos(randomDistance) - Math.sin(lat) * Math.sin(newLat)));
      nearbyCoords.push({
        'latitude': radiansToDegrees(newLat),
        'longitude': radiansToDegrees(newLng)
      });
    }
  }

  function handleCurrentPositionSuccess(position) {
    coords = position.coords;
    calculateNearbyCoordinates();
    signalCollection.positioned.dispatch(coords, nearbyCoords);
  }

  function handleCurrentPositionFailure() {
    var error = new Error('Failed to get current position!');
    signalCollection.positioned.dispatch(error);
    throw error;
  }

  function handleGeocoderResult(results, status) {
    var index = 0,
      request,
      args = [{geocoderResults: results, geocoderStatus: status}];

    function _handleGeocoderResult(results, status) {
      args.push({geocoderResults: results, geocoderStatus: status});
      index++;
      if ( index < parsedOptions.maxResults ) {
        setTimeout(_nextGeocoderRequest, 200);
      } else {
        signalCollection.located.dispatch(args);
      }
    }

    function _nextGeocoderRequest() {
      request = getGeocoderRequest(nearbyCoords[index]);
      geocoder.geocode(request, _handleGeocoderResult);
    }

    if (parsedOptions.maxResults) {
      _nextGeocoderRequest();
    } else {
      signalCollection.located.dispatch(args);
    }
  }

  function Perimeeter(options) {
    this.options = options ? parseOptions(options) : defaults;
    parsedOptions = this.options;
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

  Perimeeter.prototype.getNearbyCoordinates = function() {
    return nearbyCoords;
  };

  Perimeeter.prototype.position = function() {
    navigator.geolocation.getCurrentPosition(handleCurrentPositionSuccess, handleCurrentPositionFailure);
  };

  Perimeeter.prototype.getAddress = function() {
    var request = getGeocoderRequest(coords);
    geocoder = new google.maps.Geocoder();
    geocoder.geocode(request, handleGeocoderResult);
  };

  Perimeeter.isCapablePlatform = function() {
    return 'geolocation' in navigator;
  };

  return Perimeeter;

})();
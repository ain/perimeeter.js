/*! perimeeter.js - v0.0.1 - 2014-06-14
 * https://github.com/ain/perimeeter.js
 * Copyright © 2014 Ain Tohvri; Licensed GPL */

/* exported Perimeeter */
/* global navigator */
/* global Geocoder */
/* global signals */
var Perimeeter = (function() {

  'use strict';

  var Signal = signals.Signal,
    coords = null,
    defaults = {
      radius: 0,
      capabilityDetection: false
    },
    signalCollection = {
      positioned: null,
      approximated: null
    };


  function parseRadius(radius) {
    var parsedRadius = parseFloat(radius);
    if (/^\d+$/.test(parsedRadius)) {
      return parsedRadius;
    }
    throw new TypeError('Invalid option for radius! Number expected.');
  }

  function parseOption(option, value) {
    if (option === 'radius') {
      return parseRadius(value);
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
    signalCollection.approximated = new Signal();
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

  Perimeeter.prototype.getCoordinates = function() {
    return coords;
  };

  function handleCurrentPositionSuccess(position) {
    coords = position.coords;
    signalCollection.positioned.dispatch(coords);
  }

  function handleCurrentPositionFailure() {
    var error = new Error('Failed to get current position!');
    signalCollection.positioned.dispatch(error);
    throw error;
  }

  Perimeeter.prototype.position = function() {
    navigator.geolocation.getCurrentPosition(handleCurrentPositionSuccess, handleCurrentPositionFailure);
  };

  Perimeeter.isCapablePlatform = function() {
    return 'geolocation' in navigator;
  };

  return Perimeeter;

})();

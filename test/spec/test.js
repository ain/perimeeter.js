/*! perimeeter.js - v0.0.1 - 2014-06-14
 * * https://github.com/ain/perimeeter.js
 * * Copyright © 2014 Ain Tohvri; Licensed GPL */
'use strict';
/* jshint undef: false */
(function () {
  describe('perimeeter', function () {

    var perimeeter,
      geolocation;

    describe('init', function () {

      beforeEach(function() {
        perimeeter = new Perimeeter();
      });

      it('expected to construct object', function () {
        return expect(perimeeter).to.be.an.object;
      });

      it('expected to default radius to 0', function() {
        return expect(perimeeter.getRadius()).to.equal(0);
      });

      it('expected to set radius from constructor', function() {
        perimeeter = new Perimeeter({radius: 20});
        return expect(perimeeter.getRadius()).to.equal(20);
      });

      it('expected to throw type error on String input', function() {
        function test() {
          perimeeter = new Perimeeter('ain');
        }
        return expect(test).to.throw(TypeError);
      });
    });

    describe('capabilities', function() {
      it('expected to have no support for geolocation without mock extension', function() {
        return expect(Perimeeter.isCapablePlatform()).to.be.false;
      });

      it('expected to have support for geolocation with mock extension', function() {
        new Geolocation();
        return expect(Perimeeter.isCapablePlatform()).to.be.true;
      });
    });

    describe('geolocation mock extension', function() {

      var latitude = 53,
        longitude = 9,
        coords,
        error;

      beforeEach(function(done) {
        new Geolocation(latitude, longitude);
        navigator.geolocation.getCurrentPosition(function(response) {
          coords = response.coords;
          done();
        });
      });

      it('expected to get coordinates object', function() {
        return expect(coords).to.be.object;
      });

      it('expected to get predefined latitude and longitude', function() {
        return expect(coords).to.deep.equal({ latitude: latitude, longitude: longitude });
      });

      it('expected to return internal error on error mock input', function(done) {
        new Geolocation('error', 'error');
        navigator.geolocation.getCurrentPosition(function(position) {
          coords = position.coords;
          done();
        }, function(response) {
          error = response;
          done();
        });
        return expect(error).to.deep.equal({ code: 2, message: 'Internal error.' });
      });
    });

    describe('position', function() {

      beforeEach(function(done) {
        geolocation = new Geolocation();
        perimeeter = new Perimeeter();
        perimeeter.getSignals().positioned.add(function() {
          done();
        });
        perimeeter.position();
      });

      it('expected to set position coordinates object', function() {
        return expect(perimeeter.getCoordinates()).to.be.object;
      });

      it('expected to set position coordinates from mock extension', function() {
        var coords = {
          latitude: geolocation.latitude,
          longitude: geolocation.longitude
        };
        return expect(perimeeter.getCoordinates()).to.deep.equal(coords);
      });

      it('expected to throw error on geolocation failure', function(done) {
        new Geolocation('error');
        perimeeter = new Perimeeter();
        perimeeter.getSignals().positioned.add(function() {
          done();
        });
        function test() {
          perimeeter.position();
        }
        return expect(test).to.throw(Error);
      });

    });
  });
})();

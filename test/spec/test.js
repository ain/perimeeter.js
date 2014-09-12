/*! perimeeter.js - v0.0.1 - 2014-06-14
 * * https://github.com/ain/perimeeter.js
 * * Copyright © 2014 Ain Tohvri; Licensed GPL */
'use strict';
/* jshint undef: false, camelcase: false */
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

      it('expected to default max. results to 1', function() {
        return expect(perimeeter.getMaxResults()).to.equal(1);
      });

      it('expected to set radius from constructor', function() {
        perimeeter = new Perimeeter({radius: 20});
        return expect(perimeeter.getRadius()).to.equal(20);
      });

      it('expected to set max. results from constructor', function() {
        perimeeter = new Perimeeter({maxResults: 5});
        return expect(perimeeter.getMaxResults()).to.equal(5);
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

    describe('locate', function() {

      var locationResponse;

      before(function(done) {
        geolocation = new Geolocation();
        perimeeter = new Perimeeter();
        perimeeter.getSignals().located.add(function(response) {
          locationResponse = response;
          done();
        });
        perimeeter.getAddress();
      });

      it('expected to get response object', function() {
        return expect(locationResponse).to.be.object;
      });

      it('expected to get OK status', function() {
        return expect(locationResponse.geocoderStatus).to.equal('OK');
      });

      it('expected to get non-empty result Array', function() {
        return expect(locationResponse.geocoderResults).to.be.instanceof(Array) &&
          expect(locationResponse.geocoderResults).to.not.be.empty;
      });

      it('expected to get address with all meaningful non-empty properties', function() {
        return expect(locationResponse.geocoderResults[0]).to.contain.keys('address_components', 'formatted_address', 'geometry');
      });

      /*
       * Postcode localities may not be there.
       * TODO find coordinates that have localities.
       */
      /*it.skip('expected to get address with postcode localities', function() {
        return expect(locationResponse.geocoderResults[0].postcode_localities).to.be.instanceof(Array);
      });*/

      it('expected to get address with non-empty properties long and short name, type(s)', function() {
        return expect(locationResponse.geocoderResults[0].address_components[0]).to.contain.keys('long_name', 'short_name', 'types');
      });

      it('expected to get address with non-empty formatted address', function() {
        return expect(locationResponse.geocoderResults[0].formatted_address).to.be.not.empty;
      });

      /*
       * Debug call.
       */
      it.skip('expected to get address geometry matching user\'s location', function() {
        return expect(locationResponse.geocoderResults[0]).to.deep.equal({ lat: 53, lng: 9 });
      });


    });

    describe('nearby locations', function(){
      var locations, coords;

      before(function(done){
        perimeeter = new Perimeeter({
          radius: 1, // 1 km
          maxResults: 5
        });
        locations = perimeeter.getNearbyAddresses();
        coords = perimeeter.getCoordinates();
        done();
      });

      it('expected to get set number of results', function(){
        return expect(locations.length).to.be.equal(perimeeter.getMaxResults());
      });

      function degreesToRadians(d) {
        return d * (Math.PI/180);
      }

      // Distance is calculated using Haversine Formula(http://en.wikipedia.org/wiki/Haversine_formula)
      function getDistance(p1, p2) {
        // Use 3960.056052 for miles
        var earthRadius = 6372.796924,
          phi1 = degreesToRadians(p1.latitude),
          phi2 = degreesToRadians(p2.latitude),
          delta1 = degreesToRadians(p2.latitude - p1.latitude),
          delta2 = degreesToRadians(p2.longitude - p1.longitude),
          a, c;

        a = Math.sin(delta1/2) * Math.sin(delta1/2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(delta2/2) * Math.sin(delta2/2);
        c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return earthRadius * c;
      }

      it('expected all locations to be within set radius', function(){
        locations.forEach(function(location, index){
          describe('test location ' + (index+1) + ' distance', function(){
            it('expected location ' + (index+1) + ' to be within set radius', function(){
              return expect(getDistance(location, coords)).to.be.within(0, perimeeter.getRadius());
            });
          });
        });
      });
    });

  });
})();
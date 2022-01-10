const Lib = require("../lib.js");
var assert = require('assert');

describe('Events', function() {
  const OfferA = function() {
  return {
    issuer:"1337",
    bid: {
        minQuantity:1,
        totalQuantity:1,
        definition: {
          schema:"./test/schema.apple.json",
          asset:"./test/test.apple.json"
        }
    },
    ask: {
      minQuantity:1,
      definition: {
        schema:"./test/schema.pear.json",
        requirement:"./test/schema.pear.json"
      }
    },
    ratio:1,
    validUntil:new Date().getTime() + 86400000
    }
  }
  const OfferB = function() {
  return {
    issuer:"1337",
    bid: {
        minQuantity:1,
        totalQuantity:1,
        definition: {
          schema:"./test/schema.pear.json",
          asset:"./test/test.pear.json"
        }
    },
    ask: {
      minQuantity:1,
      definition: {
        schema:"./test/schema.apple.json",
        requirement:"./test/schema.apple.json"
      }
    },
    ratio:1,
    validUntil:new Date().getTime() + 86400000
    }
  }

  it('addOffer', function(done) {
    const lib = new Lib();

    var eventFired = false
    setTimeout(function () {
      assert(eventFired, 'Event did not fire in 1000 ms.');
      done();
    }, 1000); //timeout with an error in one second
    lib.on('addOffer',function(arg){
      eventFired = true
    });
    lib.addOffer(OfferA());
  });
  it('addOffer and discard', function(done) {
    const lib = new Lib();

    var eventFired = false
    setTimeout(function () {
      assert.equal(lib.offers.length, 0);
      done();
    }, 300); //timeout with an error in one second
    lib.on('addOffer',function(arg){
      arg._discarded = true;
    });
    lib.addOffer(OfferA());
  });

  it('refLoad', function(done) {
    const lib = new Lib();

    var eventFired = false
    setTimeout(function () {
      assert(eventFired, 'Event did not fire in 1000 ms.');
      done();
    }, 500); //timeout with an error in one second
    lib.on('refLoad',function(arg){
        eventFired = true;
    });
    lib.addOffer(OfferB());
  });
  it('matches', function(done) {
    const lib = new Lib();
    var eventFired = false
    setTimeout(function () {
      assert(eventFired, 'Event did not fire in 1000 ms.');
      done();
    }, 500); //timeout with an error in one second
    lib.on('matches',function(lib){
      eventFired = true
    });
    lib.getMatches();
  });
});

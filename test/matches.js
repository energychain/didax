const Lib = require("../lib.js");
var assert = require('assert');

describe('Matches', function() {
      it('Fit Pairing', async () => {
        const lib = new Lib();
        const OfferA = function() {
        return {
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
              requirement:"./test/schema.apple.json"
            }
          },
          ratio:1,
          validUntil:new Date().getTime() + 86400000
          }
        }
        const OfferB = function() {
        return {
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
        let offerA = OfferA();
        let offerB = OfferB();
        lib.addOffer(offerA);
        lib.addOffer(offerB);

        assert.equal(lib.offers.length, 2);
        assert.equal((lib.getMatches()).length,1);
        
        return;
      });
});

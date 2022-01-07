const Lib = require("../lib.js");
var assert = require('assert');

describe('Matches', function() {
      const OfferA = function() {
      return {
        provider:"1337",
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
        provider:"1337",
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
      it('Fit Pairing', async () => {
        const lib = new Lib();

        let offerA = OfferA();
        let offerB = OfferB();
        await lib.addOffer(offerA);
        await lib.addOffer(offerB);
        const matches = await lib.getMatches();
        assert.equal((await lib.getMatches()).length,lib.offers.length); // Do we want this?

        return;
      });
      it('Price Fit', async () => {
        const lib = new Lib();

        let offerA = OfferA();
        offerA.ratio = 2;
        let offerB = OfferB();
        offerB.ratio = 0.5;

        await lib.addOffer(offerA);
        await lib.addOffer(offerB);

        assert.equal(lib.offers.length, 2);
        assert.equal((await lib.getMatches()).length,lib.offers.length); // Do we want this?

        return;
      });
      it('No Price Fit A', async () => {
        const lib = new Lib();

        let offerA = OfferA();
        offerA.ratio = 1;
        let offerB = OfferB();
        offerB.ratio = 0.5;

        await lib.addOffer(offerA);
        await lib.addOffer(offerB);

        assert.equal(lib.offers.length, 2);
        assert.equal((await lib.getMatches()).length,0); // Do we want this?

        return;
      });
      it('No Price Fit B', async () => {
        const lib = new Lib();

        let offerA = OfferA();
        offerA.ratio = 2;
        let offerB = OfferB();
        offerB.ratio = 1;

        await lib.addOffer(offerA);
        await lib.addOffer(offerB);

        assert.equal(lib.offers.length, 2);
        assert.equal((await lib.getMatches()).length,0); // Do we want this?

        return;
      });
      it('No Price Set B', async () => {
        const lib = new Lib();

        let offerA = OfferA();
        offerA.ratio = 2;
        let offerB = OfferB();
        delete offerB.ratio;

        await lib.addOffer(offerA);
        await lib.addOffer(offerB);

        assert.equal(lib.offers.length, 2);
        assert.equal((await lib.getMatches()).length,2); // Do we want this?

        return;
      });
      it('No Price Set A and B', async () => {
        const lib = new Lib();

        let offerA = OfferA();
        delete offerA.ratio;
        let offerB = OfferB();
        delete offerB.ratio;

        await lib.addOffer(offerA);
        await lib.addOffer(offerB);

        assert.equal(lib.offers.length, 2);
        assert.equal((await lib.getMatches()).length,2); // Do we want this?

        return;
      });
});

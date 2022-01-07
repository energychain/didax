const Lib = require("../lib.js");
var assert = require('assert');

describe('Validation', function() {
      it('JSON to Schema', async () => {
        const lib = new Lib();
        const schema = require("./schema.apple.json");
        let apple = {cultivar:"Tamplin"};

        assert.equal(await lib.validate(schema,apple), true);
        apple.cultivar = 'Nothing';
        assert.equal(await lib.validate(schema,apple), false);
        apple.cultivar = "Tamplin ";
        assert.equal(await lib.validate(schema,apple), false);
        apple.cultivar = {};
        assert.equal(await lib.validate(schema,apple), false);
        apple.cultivar = ["Tamplin"];
        assert.equal(await lib.validate(schema,apple), false);
        apple.cultivar = "Collins";
        assert.equal(await lib.validate(schema,apple), true);
        return;
      });
      it('Offer Schema', async () => {
        const lib = new Lib();
        assert.throws(
          () => {
            lib.addOffer({});
          },
          Error
        );
        const Offer = function() {
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
        lib.addOffer(Offer());
        let offer = Offer();
        offer.ratio = 0;
        assert.throws(
          () => {
            lib.addOffer(offer);
          },
          Error
        );
        offer = Offer();
        offer.validUntil = 0;
        assert.throws(
          () => {
            lib.addOffer(offer);
          },
          Error
        );
        offer = Offer();
        offer.ask.definition.schema = './lib.js';
        assert.throws(
          () => {
            lib.addOffer(offer);
          },
          Error
        );
        assert.equal(lib.offers.length > 0, true);
        return;
      });
});

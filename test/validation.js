const Lib = require("../lib.js");
var assert = require('assert');

describe('Validation', function() {
      it('JSON to Schema', async () => {
        const lib = new Lib();
        const schema = require("./schema.apple.json");
        let apple = {cultivar:"Tamplin"};

        await assert.equal(await lib.validate(schema,apple), true);
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
        await assert.rejects(
          async () => {
            await lib.addOffer({});
          }
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
          provider:"1337",
          validUntil:new Date().getTime() + 86400000
        }
        }
        await lib.addOffer(Offer());
        let offer = Offer();
        offer.ratio = 0;
        await assert.rejects(
          async () => {
            await lib.addOffer(offer);
          },
          Error
        );
        offer = Offer();
        offer.validUntil = 0;
        await assert.rejects(
          async () => {
            await lib.addOffer(offer);
          }
        );
        offer = Offer();
        offer.ask.definition.schema = './lib.js';
        await assert.rejects(
          async () => {
            await lib.addOffer(offer);
          }
        );
        assert.equal(lib.offers.length > 0, true);
        return;
      });
});

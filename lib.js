module.exports = function(config) {
    const Ajv = require("ajv")
    const fs = require("fs");
    const axios = require("axios");
    const addFormats = require("ajv-formats");
    const ajv = new Ajv({allErrors: true});
    addFormats(ajv);
    this.offers = [];
    let parent = this;

    this.addOffer = function(offer) {
      if(!parent.validate(require("./didax.offer.schema.json"),offer)) {
        throw new Error('Offer Schema Validation failed');
      }
      if(offer.ratio == 0) {
        throw new Error('Ratio of 0 not supported');
      }
      if(offer.validUntil < new Date().getTime()) {
        throw new Error('validUntil < now()');
      }

      // Implement BID and ASK Schema into offer Object
      if(!fs.existsSync(offer.bid.definition.schema)) {
        throw new Error('Bid Schema not found');
      } else {
        offer.bid.definition.schema = JSON.parse(fs.readFileSync(offer.bid.definition.schema));
      }
      if(!fs.existsSync(offer.bid.definition.asset)) {
        throw new Error('Bit Asset not found');
      } else {
        offer.bid.definition.asset = JSON.parse(fs.readFileSync(offer.bid.definition.asset));
      }
      if(!fs.existsSync(offer.ask.definition.schema)) {
        throw new Error('Ask Schema not found');
      } else {
        offer.ask.definition.schema = JSON.parse(fs.readFileSync(offer.ask.definition.schema));
      }

      if(typeof offer.ask.definition.requirement !== 'undefined') {
        if(!fs.existsSync(offer.ask.definition.requirement)) {
          throw new Error('Ask Requirement not found');
        } else {
          offer.ask.definition.requirement = JSON.parse(fs.readFileSync(offer.ask.definition.requirement));
        }
      }

      if(!parent.validate(offer.bid.definition.schema,offer.bid.definition.asset)) {
        throw new Error('Bid Asset not Valid for Bid Schema.');
      }
      this.offers.push(offer);
    }

    this.getMatches = function() {
      let matches = [];
      return matches;
    }
    this.validate = function(schema,data) {
      const validate = ajv.compile(schema)
      return validate(data)
    }

    return this;
}

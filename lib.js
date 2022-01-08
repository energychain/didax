const EventEmitter = require('events');

class Didax extends EventEmitter {
 constructor(config) {
    super();
    const Ajv = require("ajv")
    const eventEmitter = new EventEmitter();
    const addFormats = require("ajv-formats");
    const Loader = require("./refLoader.js");
    const parent = this;
    const refLoader = new Loader(config);

    refLoader.on('load',function(uri) {
      parent.emit('refLoad',uri);
    });
    const ajv = new Ajv({allErrors: true});
    addFormats(ajv);
    this.offers = [];


    this.addOffer = async function(offer) {

      if(!await parent.validate(await refLoader.load("./didax.offer.schema.json"),offer)) {
        throw new Error('Offer Schema Validation failed');
      }
      if(offer.ratio == 0) {
        throw new Error('Ratio of 0 not supported');
      }
      if(offer.validUntil < new Date().getTime()) {
        throw new Error('validUntil < now()');
      }

      offer.bid.definition.schema = await refLoader.load(offer.bid.definition.schema);
      offer.bid.definition.asset = await refLoader.load(offer.bid.definition.asset);
      offer.ask.definition.schema = await refLoader.load(offer.ask.definition.schema);

      if(typeof offer.ask.definition.requirement !== 'undefined') {
        offer.ask.definition.requirement = await refLoader.load(offer.ask.definition.requirement);
      }

      if(!await parent.validate(offer.bid.definition.schema,offer.bid.definition.asset)) {
        throw new Error('Bid Asset not Valid for Bid Schema.');
      }
      parent.emit('addOffer',offer);
      if(typeof offer._discarded == 'undefined') this.offers.push(offer);
      return this.offers.length;
    }

    this.getMatches = async function() {
      let matches = [];
      for(let i=0;i<this.offers.length;i++) {
        for(let j=0;j<this.offers.length;j++) {
          if(this.offers[i].bid.definition.schema["$id"] == this.offers[j].ask.definition.schema["$id"]) {
            if(
                 ((typeof this.offers[i].ratio == 'undefined') || (typeof this.offers[j].ratio == 'undefined')) ||
                 (this.offers[i].ratio == (1/this.offers[j].ratio))
               ) {
                let requirementMatch = true;
                if(typeof this.offers[i].ask.definition.requirement !== 'undefined') {
                  requirementMatch = await parent.validate(this.offers[i].ask.definition.requirement,this.offers[j].bid.definition.asset);
                }
                if((requirementMatch) && (typeof this.offers[j].ask.definition.requirement !== 'undefined')) {
                  requirementMatch = await parent.validate(this.offers[j].ask.definition.requirement,this.offers[i].bid.definition.asset);
                }
                if(requirementMatch) {
                  const match = {pair:[
                    this.offers[i],
                    this.offers[j]
                  ]}
                  parent.emit('match',match);
                  if(typeof match._discarded == 'undefined') {
                    matches.push(match);
                  }
                }
            }
          }
        }
      }
      this.emit('matches',matches);
      return matches;
    }

    this.validate = async function(schema,data) {
      const v =  await ajv.getSchema(schema["$id"])
              ||  await ajv.compile(schema)
      return v(data);
    }

    return this;
}}

module.exports = Didax;

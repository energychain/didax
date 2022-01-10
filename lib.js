const EventEmitter = require('events');

class Didax extends EventEmitter {
 constructor(config) {
    super();
    const Ajv = require("ajv")
    const eventEmitter = new EventEmitter();
    const addFormats = require("ajv-formats");
    const Loader = require("./refLoader.js");
    const parent = this;

    if((typeof config == 'undefined')||(config == null)) {
      config = {};
    }
    parent.config = config;
    const refLoader = new Loader(config);


    if(typeof parent.config.schema_hub == 'undefined') {
      parent.config.schema_hub = 'https://corrently.io/schemas/';
    }
    refLoader.on('load',function(uri) {
      parent.emit('refLoad',uri);
    });
    const ajv = new Ajv({allErrors: true,strict: false, allowUnionTypes: true});
    addFormats(ajv);
    this.offers = [];
    this.expired = [];

    this.addOffer = async function(offer) {
      if(!await parent.validate(await refLoader.load(parent.config.schema_hub + "didax.offer.schema.json"),offer)) {
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

      if(typeof offer.ask.presentations !== 'undefined') {
        const pdSchema = await refLoader.load(parent.config.schema_hub + "dif.presentation_definition.schema.json");
        let presentationsValid = true;
        for(let i=0;i<offer.ask.presentations.length;i++) {
          offer.ask.presentations[i] = await refLoader.load(offer.ask.presentations[i]);
          if(!await parent.validate(pdSchema,offer.ask.presentations[i])) presentationsValid = false;
        }
        if(!presentationsValid) throw new Error('Ask Presentation Definitions invalid');
      }

      if(!await parent.validate(offer.bid.definition.schema,offer.bid.definition.asset)) {
        throw new Error('Bid Asset not Valid for Bid Schema.');
      }
      parent.emit('addOffer',offer);
      if(typeof offer._discarded == 'undefined') this.offers.push(offer);
      return this.offers.length;
    }

    this.getMatches = async function() {
      const matches = [];
      const expires = [];
      const now = new Date().getTime();
      for(let i=0;i<this.offers.length;i++) {
        if(this.offers[i].validUntil < now) expires.push(""+i);
      };
      for(let i=0;i<expires.length;i++) {
        this.expired.push(this.offers[expires[i]*1]);
        parent.emit('expired',this.offers[expires[i]*1]);
        this.offers.splice(expires[i] * 1, 1);
      }

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

                let claimCheck = false;
                if(typeof this.offers[i].ask.presentations !== 'undefined') claimCheck = true;
                if(typeof this.offers[j].ask.presentations !== 'undefined') claimCheck = true;
                if((claimCheck)&&(requirementMatch)) {
                  if(typeof this.offers[i].ask.presentations !== 'undefined') {
                    for(let k=0;k<this.offers[i].ask.presentations.length;k++) {
                      if(typeof this.offers[i].ask.presentations == 'string') this.offers[i].ask.presentations = refLoader.load(this.offers[i].ask.presentations);
                      if(typeof this.offers[j].bid.claims == 'undefined') { requirementMatch = false; } else {
                        let hasClaim = false;
                        for(let l=0;l<this.offers[j].bid.claims.length;l++) {
                              if(typeof this.offers[j].bid.claims[l] == 'string') {
                                this.offers[j].bid.claims[l] = await refLoader.load(this.offers[j].bid.claims[l]);
                              }
                              if(this.offers[j].bid.claims[l].presentation_submission.definition_id == this.offers[i].ask.presentations[k].presentation_definition.id) {
                                hasClaim = true;
                              }
                        }
                        if(!hasClaim) requirementMatch = false;
                      }
                    }
                  }
                  if((requirementMatch) && (typeof this.offers[j].ask.presentations !== 'undefined')) {
                  for(let k=0;k<this.offers[j].ask.presentations.length;k++) {
                    if(typeof this.offers[j].ask.presentations == 'string') this.offers[j].ask.presentations = refLoader.load(this.offers[j].ask.presentations);
                    if(typeof this.offers[i].bid.claims == 'undefined') { requirementMatch = false; } else {
                      let hasClaim = false;
                      for(let l=0;l<this.offers[i].bid.claims.length;l++) {
                            if(typeof this.offers[i].bid.claims[l] == 'string') {
                              this.offers[i].bid.claims[l] = await refLoader.load(this.offers[i].bid.claims[l]);
                            }
                            if(this.offers[i].bid.claims[l].presentation_submission.definition_id == this.offers[j].ask.presentations[k].presentation_definition.id) {
                              hasClaim = true;
                            }
                      }
                      if(!hasClaim) requirementMatch = false;
                    }
                  }
                  }
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
      if(typeof schema["$id"] == 'undefined') {
        schema["$id"] = 'local/tmp/' + new Date().getTime() + '/' + Math.random();
      }
      const v =  await ajv.getSchema(schema["$id"])
              ||  await ajv.compile(schema)
      const valid = v(data);

      return valid;
    }

    return this;
}}

module.exports = Didax;

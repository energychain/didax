const EventEmitter = require('events');

class RefLoader extends EventEmitter {
 constructor(config) {
   super();
   const fs = require("fs");

  this.load = async function(uri) {
      this.emit('load',uri);
      if(!fs.existsSync(uri)) throw new Error("File does not exist",uri);
      let data = JSON.parse(fs.readFileSync(uri));
      return data;
    }
  }
}
module.exports = RefLoader;

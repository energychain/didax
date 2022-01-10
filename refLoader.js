const EventEmitter = require('events');

class RefLoader extends EventEmitter {
 constructor(config) {
   super();
   const fs = require("fs");
   const memstorage = {};

  this.load = async function(uri) {
      if(typeof memstorage[uri] !== 'undefined') {
        this.emit('load-cache',uri);
        return memstorage[uri];
      }

      this.emit('load',uri);
      let url = null;
      try {
        url = new URL(uri);
        const axios = require("axios");
        const responds = await axios.get(uri);
        memstorage[uri] = responds.data;
        this.emit('load-remote',uri);
        return responds.data;
      } catch(e) {
        url = null;
        // fallback to local file
      }
      if(url == null) {
        if (!fs.existsSync(uri)) throw new Error("File does not exist",uri);
        this.emit('load-filesystem',uri);
        let data = JSON.parse(fs.readFileSync(uri));
        memstorage[uri] = data;
        return data;
      }
    }
  }
}
module.exports = RefLoader;

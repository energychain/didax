const fs = require("fs");
module.exports = function(config) {
    this.load = async function(uri) {
      if(!fs.existsSync(uri)) throw new Error("File does not exist",uri);
      let data = JSON.parse(fs.readFileSync(uri));
      return data;
    }
}

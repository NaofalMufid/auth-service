const db = require("../../models"),
    User = db.users,
    uaParser = require('ua-parser-js');

module.exports = {
  createLog: async(req, res, next) => {  
    var ua = uaParser(req.headers['user-agent']);
    // console.log("ipnya:",req.ip, "uanya:",ua, "browsernya:",ua.browser.name, "devicenya:",ua.device.type, "osnya:",ua.os.name);
    return ua;
  }  
}
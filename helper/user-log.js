const db = require("../models"),
    UserLog = db.user_log,
    uaParser = require('ua-parser-js')

module.exports = {
  createLog: (user_agent, header, activity) =>{
    var getUserId = null
    if (!header.authorization) {
        getUserId = 0
    } else {
        getUserId = middleware.tokenDecoded(header.authorization)
    }    
    var userId = getUserId
    var ua = uaParser(user_agent)
    var new_user_log = {
      user_id: userId,
      activity: activity,
      ip: header.ip,
      ua: user_agent,
      browser: ua.browser.name,
      device: ua.device.type,
      os: ua.os.name, 
    }
    if (new_user_log) {
      UserLog.create(new_user_log)
        .then(() => {
          return "Logger terbuat"
        })
        .catch((err) => {
          return "Error" + err
        })
    } else {
      return "Error"
    }
  }  
}
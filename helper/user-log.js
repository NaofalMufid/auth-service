const db = require("../models"),
    UserLog = db.user_log,
    middleware = require('../middlewares/middleware'),
    uaParser = require('ua-parser-js')

module.exports = {
  createLog: (user_agent, header, activity, userId) =>{
    var getUserId = null
    // console.log(header.headers)
    if (header.headers.authorization == undefined) {
        if (userId != null) {
          getUserId = userId  
        }else{
          getUserId = 0
        }
    } else {
        getUserId = middleware.tokenDecoded(header.headers)
        getUserId = getUserId.id
    }    
    var user_id = getUserId
    var ua = uaParser(user_agent)
    var new_user_log = {
      user_id: user_id,
      activity: activity,
      ip: header.ip,
      ua: user_agent,
      browser: ua.browser.name,
      device: ua.device.type,
      os: ua.os.name, 
    }
    // console.log(user_id)
    // console.log(new_user_log)
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
  },
  
  userLogList: (req, res) => {
    try {
      UserLog.findAll({
        attributes: {
          exclude: ["createdAt", "updatedAt"]
        }
      })
        .then((userLog) => {
          res.status(200).send(userLog)
        })
        .catch((err) => {
          res.status(400).send(err.message)
        })
    } catch (error) {
      res.status(500).send(error.message)
    }    
  }
}
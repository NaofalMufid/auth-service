const { decode } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const secret = process.env.JWT_SECRET;

const getToken = (headers) => {
  if (headers && headers.authorization) {
    //
    //debugging
    // console.log("\nHEADER AUTHORIZATION:\n", headers.authorization, "\n");

    var parted = headers.authorization.split(" ");
    if (parted.length === 2) {
      if (parted[0] == "JWT") {
        return parted[1];
      }
    } else {
      return null;
    }
  } else {
    return null;
  }
};

const verifyToken = (rolesArray) => (req, res, next) => {
  var token = getToken(req.headers);

  const decoded = decode(token);
  var authorized = false;
  
  //if user has a role that is required to access any API
  authorized = rolesArray.includes(decoded.role);
  if (token && authorized) {
    jwt.verify(token, secret, (err, decode) => {
      if(err){
          return res.status(500).send({
              auth: false,
              message: "Error",
              errors: err
          });
      }
      // console.log("ini adalah decode.role =", decode.role);
      next();
    });

  } else {
    res.status(403).send({
      success: false,
      message: "Access denied",
    });
  }
}

const tokenDecoded = (req, res, next) => {
  var token = getToken(req.headers);
  const decoded = decode(token);

  if (token) {
    res.send({
      success: true,
      data: decoded,
    });
    next();
  } else {
    res.status(403).send({
      success: false,
      message: "token not valid",
    });
  }
};

module.exports = {
  verifyToken,
  tokenDecoded,
};

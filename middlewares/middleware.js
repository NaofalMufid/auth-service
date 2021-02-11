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
  if (token) {
    authorized = rolesArray.includes(decoded.role);
    if (authorized) {
      jwt.verify(token, secret, (err, decode) => {
        if(err){
            return res.status(500).send({
                auth: false,
                message: "Error",
                errors: err
            });
        }
        next();
      });
    }

  } else {
    res.status(403).send({
      success: false,
      message: "Access denied",
    });
  }
}

const tokenDecoded = (headers) => {
  var reqToken = headers.authorization; 
  var parted = reqToken.split(" ");
  if (parted.length === 2) {
      if (parted[0] === "JWT") {
          parted = parted[1];
      }
  } else {
      parted = null;
  }
  var decoded = decode(parted);
  return decoded;
}

module.exports = {
  verifyToken,
  tokenDecoded
};

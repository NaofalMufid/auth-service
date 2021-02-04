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

function verifyToken(req, res, next) {
  var token = getToken(req.headers);

  const decoded = decode(token);
//   console.log(`ini adalah decode ${token}`);

  const reqBodyUserId = req.body.user_id;
  const reqParamsUserId = req.params.id;

  if (
    (token && reqBodyUserId == decoded.id) ||
    (token && reqParamsUserId == decoded.id)
  ) {
    // verifyJwt(token);
    // next();
    jwt.verify(token, secret, (err, decode) => {
      if(err){
          return res.status(500).send({
              auth: false,
              message: "Error",
              errors: err
          });
      }
    //   console.log("ini adalah decode.id", decode.user_id)
      req.userId = decode.user_id;
      next();
    });
  } else {
    res.status(403).send({
      success: false,
      message: "access denied",
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

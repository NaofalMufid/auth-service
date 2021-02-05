const { verify } = require("crypto");
const jwt = require("jsonwebtoken");
const { decode } = require("punycode");
const secretKey = process.env.JWT_SECRET;
const db  = require("../models");
const User = db.users;

module.exports = {
    verifyToken: (req, res, next) => {
        let token = req.headers["Authorization"];

        if (!token) {
            return res.status(403).send({
                message: "No token provided!"
            });
        }

        jwt.verify(token, secretKey, (err, decoded) => {
            if (err) {
                return res.status(401).send({
                    message: "Unauthorized!"
                });
            }
            req.userId = decode.id;
            next();
        });
    },

    isAdmin: (req, res, next) => {
        User.findByPk(req.userId).then(user => {
            user.getRoles().then(roles => {
                for (let i = 0; i < roles.length; i++) {
                    if (roles[i].name === "admin") {
                        next();
                        return;
                    }
                }
                res.status(403).send({
                    message: "Require Admin Role!"
                });
                return;
            })
        })
    }
}
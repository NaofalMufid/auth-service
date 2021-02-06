const db  = require("../models");
const User = db.users;

module.exports = {

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
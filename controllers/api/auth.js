const { token } = require("morgan")

const db = require("../../models"),
    User = db.users,
    bcrypt = require("bcryptjs"),
    jwt = require("jsonwebtoken"),
    path = require("path"),
    crypto = require("crypto"),
    secretToken = process.env.JWT_SECRET

const hbs = require("nodemailer-express-handlebars"),
    email = process.env.MAILER_EMAIL_ID,
    pass = process.env.MAILER_PASSWORD,
    nodemailer = require("nodemailer")

const smtpTransport = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE_PROVIDER,
    auth: {
        user: email,
        pass: pass
    }
})

const handlebarsOptions = {
    viewEngine: 'handlebars',
    viewPath: path.resolve("./views/templates/"),
    extName: '.html'
}

smtpTransport.use('compile', hbs(handlebarsOptions))

module.exports = {
    register: (req, res) => {
        const registerUserReqBody = {
            username: req.body.username,
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
        };
      
        if (
            !registerUserReqBody.username ||
            !registerUserReqBody.email ||
            !registerUserReqBody.password
        ) {
            res.status(400).send({
                message: "please fill form username,password, email",
            });
        } else {
        User.create(registerUserReqBody)
        .then(() => {
            res.status(201).send({
                message: "user registration success",
            });
        })
        .catch((err) => {
            res.status(500).send({
                message: err.message || "error while registration user",
            });
        });
        }    
    },

    login: (req, res) => {
        User.findOne({
            where: { email: req.body.email },
        })
        .then((user) => {
            if (!user) {
                return res.status(401).send({
                    status: "failed",
                    message: "Authentication failed. User not found.",
                });
            }
            user.checkPassword(req.body.password, (err, isMatch) => {
            if (isMatch && !err) {
                var token = "JWT " + jwt.sign(
                        { _id: user.id, username: user.username },
                        secretToken,
                        { expiresIn: 86400 * 30}
                    )
                res.json({
                    token
                });
            } else {
                res.status(401).send({
                status: false,
                message: "Authentication failed. Wrong Password.",
                });
            }
            });
        })
        .catch((error) =>
            res.status(400).send({
            status: false,
            message: error,
            })
        );
    },
    
    home: (req, res) => {
        return res.sendFile(path.resolve("views/home.html"))
    },

    forgot_password_template: (req, res) => {
        return res.sendFile(path.resolve("views/forgot-password.html"))
    },
    
    reset_password_template: (req, res) => {
        return res.sendFile(path.resolve("views/reset-password.html"))
    },

    forgot_password: (req, res) => {
            try {
                User.findOne({
                    where: {email: req.body.email},
                    attributes: { exclude : ["password", "createdAt", "updatedAt"] }
                })
                .then((user) => {
                    if (!user) {
                        return res.status(401).send({
                            status: "failed",
                            message: "Authentication failed. User not found.",
                        });    
                    }

                    crypto.randomBytes(20, (err, buffer) => {
                        var token = buffer.toString('hex')
                        if (!err) {
                            res.status(200).send({
                                user,
                                token
                            })
                        } else {
                            res.status(401).send({
                                status: false,
                                message: "Failed"
                            })
                        }
                        console.log("tokenya ",token)
                        User.update(
                            {reset_password: token, reset_password_expires: Date.now() + 864000000},
                            { where: {id: user.id} },
                            // { upsert: true, new: true }
                        )
                        .then((new_user) => {
                            if (!new_user) {
                                res.send("Error")    
                            }
                            res.status(200).send({
                                status: "Ok",
                                token,
                                new_user
                            })
                        })
                    })
                    
                    var data = {
                        to: user.email,
                        from: email,
                        template: 'forgot-password-email',
                        subject: 'Password reset help',
                        content: {
                            url: 'http://localhost:3030/api/reset_password?token=' + token,
                            name: user.username
                        }
                    }

                    smtpTransport.sendMail(data, (err) => {
                        if (!err) {
                            return res.json({ message: 'Dicek ya emailnya untuk instruksi lanjut' })
                        } else {
                            return res.json(err)
                        }
                    })
                })
            } catch (error) {
                res.status(500).send({
                    message:
                    error.message
                })      
            }
    },

    reset_password: (req, res) => {
        User.findOne({
            reset_password: req.body.token,
            reset_password_expires: {
                $gt : Date.now()
            }
        }).exec(function(err, user) {
            if (!err && user) {
                if (req.body.newPassword == req.body.verifyPassword) {
                    user.password = bcrypt.hashSync(req.body.newPassword, 10)
                    user.reset_password = undefinded
                    user.reset_password_expires = undefined
                    user.save(function(err) {
                        if (err) {
                            return res.status(422).send({
                                message: err
                            })
                        } else {
                            var data = {
                                to: user.email,
                                from: email,
                                template: 'reset-password-email',
                                subject: 'Password Reset Confirmation',
                                context: {
                                    name: user.username
                                }
                            }

                            smtpTransport.sendMail(data, function (err) {
                                if (!err) {
                                    return res.json({ message: 'Password reset' })
                                } else {
                                    return done(err)
                                }
                            })
                        }
                    })
                } else {
                    return res.status(422).send({
                        message: 'Password do not match'
                    })
                }
            } else {
                return res.status(400).send({
                    message: 'Password reset token is invalid or has expired.'
                })
            }
        })
    }
}
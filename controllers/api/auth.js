const db = require("../../models"),
    User = db.users,
    Role = db.roles,
    bcrypt = require("bcryptjs"),
    jwt = require("jsonwebtoken"),
    crypto = require("crypto"),
    UserLog = require("../../helper/user-log"),
    {Op} = require("sequelize")

const emailSender = process.env.MAILER_EMAIL_ID,
    pass = process.env.MAILER_PASSWORD,
    nodemailer = require("nodemailer")

const smtpTransport = nodemailer.createTransport({
    service: process.env.MAILER_SERVICE_PROVIDER,
    auth: {
        user: emailSender,
        pass: pass
    }
})

var refreshTokens = {}

module.exports = {
    home: (req, res)  => {
        const user_agent = req.headers['user-agent']
        const header = req
        res.status(200).send({
            message: "Hello Bro"
        })     
        var bisa = UserLog.createLog(user_agent,header, "coba coba doang kok")
        
    },
    
    register: async(req, res) => {
        const user_agent = req.headers['user-agent']
        const header = req
        try {
            if (
                !req.body.username ||
                !req.body.email ||
                !req.body.password
            ) {
                res.status(400).send({
                    message: "please fill form username,password, email",
                });
            } else {
                const registerUser = {
                    username: req.body.username,
                    email: req.body.email,
                    password: bcrypt.hashSync(req.body.password, 10)
                };
                // Username check
                await User.findOne({
                    where: {
                        [Op.or]:[
                            {username: req.body.username},
                            {email: req.body.email}
                        ]
                    }
                }).then(user => {
                    if (user) {
                        UserLog.createLog(user_agent,header, "Failed on register new user")
                        res.status(400).send({
                            message: "Failed! Username or Email is already in use!"
                        });
                    } else {
                        // Save user to database
                        User.create(registerUser)
                        .then((user) => {
                            verificationToken= crypto.randomBytes(16).toString('hex')
                            user.verificationToken = verificationToken
                            user.save()
                            var verificationUrl = `http://localhost:3030/api/confirmation?tokenActivation=${verificationToken}`
                            var data = {
                                to: user.email,
                                from: emailSender,
                                subject: 'Account Verification',
                                html: `<p>This link for verification your account</p> <p>${verificationUrl}</p>`
                            }
                            smtpTransport.sendMail(data, (err) => {
                                if (!err) {
                                    UserLog.createLog(user_agent,header, "New user has been register")
                                    return res.status(200).send({
                                        message: "Registration successfully and check your email for verified account!"
                                    })
                                } else {
                                    UserLog.createLog(user_agent,header, "Failed on user registration")
                                    return res.status(500).send({
                                        message: 'error sending email activation account'+err
                                    })
                                }
                            })
                        })
                        .catch((err) => {
                            res.status(500).send({
                                message:
                                    err.message || "Some error occured on registration new user!"
                            })
                        })
                    }
                });
    
            }
        } catch (error) {
            UserLog.createLog(user_agent,header, "Trying to register new user")
            res.status(500).send({
                message:
                    error.message
            })
        }      
    },

    login: (req, res) => {
        const user_agent = req.headers['user-agent']
        const header = req
        User.findOne({
            include: [
                {
                    model: Role,
                    attributes: {exclude:[ "createdAt", "updatedAt"]}
                }
            ],
            attributes: { 
                exclude: ["roleId", "reset_password", "reset_password_expires", "createdAt", "updatedAt"]
            },
            where: { email: req.body.email },
        })
        .then((user) => {
            if (!user || user.is_active === false) {
                UserLog.createLog(user_agent,header, "Trying login with user not registered")
                return res.status(401).send({
                    status: "failed",
                    message: "Authentication failed. User not found or User is not active.",
                });
            }
            user.checkPassword(req.body.password, (err, isMatch) => {
            if (isMatch && !err) {
                var token = "JWT " + jwt.sign(
                    { id: user.id, username: user.username, role: user.role['name'] },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_LIFE}
                )
                var refreshToken = jwt.sign(
                    { id: user.id, username: user.username, role: user.role['name'] },
                    process.env.REFRESH_SECRET,
                    { expiresIn: process.env.REFRESH_LIFE}
                )             
                const response = {
                    "status": "Logged in",
                    "token": token,
                    "refreshToken": refreshToken,
                }           
                refreshTokens[refreshToken] = response
                res.send({
                    response
                });
                UserLog.createLog(user_agent, header, "Success login", user.id)
            } else {
                UserLog.createLog(user_agent,header, "Trying login with wrong password")
                res.status(401).send({
                    status: false,
                    message: "Authentication failed",
                });
            }
            });
        })
        .catch((error) =>
            res.status(400).send({
            status: false,
            message: error.message,
            })
        );
    },

    newToken: (req, res) =>{
        const postData = req.body
        if (postData.refreshToken && (postData.refreshToken in refreshTokens)) {
            User.findOne({
                include: [
                    {
                        model: Role,
                        attributes: {exclude:[ "createdAt", "updatedAt"]}
                    }
                ],
                attributes: { 
                    exclude: ["roleId", "reset_password", "reset_password_expires", "createdAt", "updatedAt"]
                },
                where: { email: postData.email },
            })
            .then((user) => {
                if (!user || user.is_active === false) {
                    // UserLog.createLog(user_agent,header, "Trying login with user not registered")
                    return res.status(401).send({
                        status: "failed",
                        message: "Authentication failed. User not found or User is not active.",
                    });
                }
                const token = "JWT " + jwt.sign(
                    { id: user.id, username: user.username, role: user.role['name'] },
                    process.env.JWT_SECRET,
                    { expiresIn: process.env.JWT_LIFE}
                )
                const response = {
                    "token": token,
                }
                refreshTokens[postData.refreshToken].token = token
                res.status(200).send({response})
            })
        } else {
            
        }
    },
    
    forgot_password: async (req, res) => {
        const email = req.body.email
        const buffer = await crypto.randomBytes(32)
        const passwordResetToken = buffer.toString("hex")
        // for user log
        const user_agent = req.headers['user-agent']
        const header = req
        try {
            await User.findOne({
                where: {email: email}
            }).then(user => {
                if (user) {
                    var user_id = user.id
                    User.update(
                            {
                                reset_password: passwordResetToken,
                                reset_password_expires: Date.now() + 86400
                            },
                            {where: {email : email}}
                        )
                        .then((user) => {
                            const passwordResetUrl = `http://localhost:3030/api/reset_password?resetToken=${passwordResetToken}`
                            var data = {
                                to: email,
                                from: emailSender,
                                subject: 'Password reset help',
                                html: `<p>Hello, ${user.name}</p><p>Ini link reset password mu</p> <p>${passwordResetUrl}</p>`
                            }
                            smtpTransport.sendMail(data, (err) => {
                                if (!err) {
                                    UserLog.createLog(user_agent,header, "Request forgot password ok!", user_id)
                                    return res.status(200).send({
                                        message: "Check your email"
                                    })
                                } else {
                                    UserLog.createLog(user_agent,header, "Request forgot password failed!", user_id)
                                    return res.status(500).send({
                                        message: 'error sending email '+err
                                    })
                                }
                            })
                        })
                        .catch((err) => {
                            UserLog.createLog(user_agent,header, "Request forgot password failed!", user_id)
                            res.status(403).send(err)
                        })
                } else {
                    res.status(400).send({
                        message: "Failed! email is not registered in the system!"
                    });
                }
            });

        } catch (error) {
            res.status(500).send("error");
        }        
    },

    reset_password: async(req, res) => {
        const user_agent = req.headers['user-agent']
        const header = req
            try {
                await User.findOne({
                    where: {
                        reset_password: req.body.resetToken,
                        // reset_password_expires: {$gt : Date.now()}
                    }
                })
                .then((user) => {
                    if (!user) {
                        UserLog.createLog(user_agent,header, "Request reset password failed")
                        return res.status(401).send({
                            status: "failed",
                            message: "Failed. wrong token reset password.",
                        });    
                    } else {
                        new_pass = req.body.newPassword
                        ver_pass = req.body.verifyPassword
                        user.password = bcrypt.hashSync(new_pass, 10)
                        user.reset_password = null
                        user.reset_password_expires = null
                        if (new_pass === ver_pass) {
                            if (user.save()) {
                                UserLog.createLog(user_agent,header, "Reset password ok!", user.id)
                                return res.status(200).send({
                                    message: "Reset password successfully"
                                })
                            } else {
                                UserLog.createLog(user_agent,header, "Reset password failed!", user.id)
                                return res.status(422).send({
                                    message: "Error was occured"
                                })        
                            }
                        } else {
                            return res.status(422).send({
                                message: "Password does not match!"
                            })
                        }
                    }             
                })
            } catch (error) {
                res.status(500).send({
                    message: error.message
                })      
            }
    },

    confirmationAccount: (req, res) => {
        const user_agent = req.headers['user-agent']
        const header = req
        var token= req.body.tokenActivation
        // console.log(token)
        try {
            User.findOne({where:{verificationToken: token}})
                .then(user => {
                    if (user) {
                        var user_id = user.id
                        user.isVerified = true
                        user.verificationToken = null
                        user.save()
                        UserLog.createLog(user_agent,header, "Success Activation account", user_id)
                        return res.status(200).send({
                            message: "Activation account success"
                        })
                    } else {
                        UserLog.createLog(user_agent,header, "Failed activation account!", user_id)
                        return res.status(422).send({
                            message: "Error was occured activated account"
                        })
                    }
                })
        } catch (error) {
            return res.status(500).send({
                message: error.message
            })
        }
    },

    resendConfirmation: (req, res) => {
        const user_agent = req.headers['user-agent']
        const header = req
        var email = req.body.email
        try {
            User.findOne({where:{email: email}})
                .then(user => {
                    var verificationToken= crypto.randomBytes(16).toString('hex')
                    user.verificationToken = verificationToken
                    user.save()
                    var verificationUrl = `http://localhost:3030/api/confirmation?tokenActivation=${verificationToken}`
                    var data = {
                        to: user.email,
                        from: emailSender,
                        subject: 'Account Verification',
                        html: `<p>This link for verification your account</p> <p>${verificationUrl}</p>`
                    }
                    smtpTransport.sendMail(data, (err) => {
                        if (!err) {
                            UserLog.createLog(user_agent,header, "Resend activation account!", user.id)
                            return res.status(200).send({
                                message: "Resend activation account!"
                            })
                        } else {
                            UserLog.createLog(user_agent,header, "Failed resend activation account!", user.id)
                            return res.status(500).send({
                                message: 'error sending email activation'+err
                            })
                        }
                    })
                })
        } catch (error) {
            return res.status(500).send({
                message: error.message
            })
        }
    }
}
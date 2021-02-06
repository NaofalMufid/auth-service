const db = require("../../models"),
    User = db.users,
    Role = db.roles,
    bcrypt = require("bcryptjs"),
    jwt = require("jsonwebtoken"),
    crypto = require("crypto"),
    secretToken = process.env.JWT_SECRET

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

module.exports = {
    register: async(req, res, next) => {
        try {
            const registerUser = {
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10)
            };
    
            if (
                !registerUser.username ||
                !registerUser.email ||
                !registerUser.password
            ) {
                res.status(400).send({
                    message: "please fill form username,password, email",
                });
            } else {
                // Username check
                await User.findOne({
                    where: {username: req.body.username}
                }).then(user => {
                    if (user) {
                        res.status(400).send({
                            message: "Failed! Username is already in use!"
                        });
                        return;
                    }
                    next();
                });
    
                // Email check
                await User.findOne({
                    where: {email: req.body.email}
                }).then(user => {
                    if (user) {
                        res.status(400).send({
                            message: "Failed! Email is already in use!"
                        });
                        return;
                    }
                    next();    
                });
    
                // Save user to database
                await User.create(registerUser)
                .then(() => {
                    return res.status(200).send({
                        message: "user registration success",
                    });
                })
                .catch((err) => {
                    res.status(404).send({
                        message: err.message || "error while registration user",
                    });
                });
            }
        } catch (error) {
            next(error);
        }      
    },

    login: (req, res) => {
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
                return res.status(401).send({
                    status: "failed",
                    message: "Authentication failed. User not found or User is not active.",
                });
            }
            user.checkPassword(req.body.password, (err, isMatch) => {
            if (isMatch && !err) {
                var token = "JWT " + jwt.sign(
                        { id: user.id, username: user.username, role: user.role['name'] },
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
    
    forgot_password: async (req, res) => {
        const email = req.body.email
        const buffer = await crypto.randomBytes(32)
        const passwordResetToken = buffer.toString("hex")
        try {
            await User.update(
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
                        html: `<p>Ini link reset password mu</p> <p>${passwordResetUrl}</p>`
                    }
                    smtpTransport.sendMail(data, (err) => {
                        if (!err) {
                            return res.status(200).send({
                                message: "Check your email"
                            })
                        } else {
                            return res.status(500).send({
                                message: 'error sending email '+err
                            })
                        }
                    })
                })
                .catch((err) => {
                    res.status(403).send(err)
                })

        } catch (error) {
            res.status(500).send("error");
        }        
    },

    reset_password: async(req, res) => {
            try {
                await User.findOne({
                    where: {
                        reset_password: req.body.resetToken,
                        // reset_password_expires: {$gt : Date.now()}
                    }
                })
                .then((user) => {
                    if (!user) {
                        return res.status(401).send({
                            status: "failed",
                            message: "Failed. this user not request changing password.",
                        });    
                    } else {
                        new_pass = req.body.newPassword
                        ver_pass = req.body.verifyPassword
                        user.password = bcrypt.hashSync(new_pass, 10)
                        user.reset_password = null
                        user.reset_password_expires = null
                        if (new_pass === ver_pass) {
                            if (user.save()) {
                                return res.status(200).send({
                                    message: "Reset password successfully"
                                })
                            } else {
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
}
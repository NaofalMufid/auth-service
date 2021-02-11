const db = require("../../models"),
    User = db.users,
    Role = db.roles,
    middleware = require('../../middlewares/middleware'),
    UserLog = require("../../helper/user-log"),
    bcrypt = require("bcryptjs")

module.exports = {
    index: async(req, res) => {
        const user_agent = req.headers['user-agent']
        const header = req
        try {
            await User.findAll({
                include: [
                    {
                        model: Role,
                        // where: {name: "nonadmin"},
                        attributes: {exclude:["id", "createdAt", "updatedAt"]}
                    },
                    {
                        model: User,
                        as: "creator",
                        attributes: { exclude: ["id", "email", "is_active", "roleId", "createdBy", "role_id", "password", "reset_password", "reset_password_expires", "createdAt", "updatedAt"] }
                    }
                ],
                attributes: { 
                    exclude: ["role_id", "roleId", "password", "reset_password", "reset_password_expires", "createdAt", "createdBy", "updatedAt"]
                },
                order: [['username', 'ASC']]

            })
            .then((users) => {
                if (users.length > 0) {
                    UserLog.createLog(user_agent, header, "Show All User activity")
                    res.status(200).send(users)
                } else {
                    res.status(400).send({
                        message: "User data is empty"
                    })
                }
            })
            .catch((err) => {
                UserLog.createLog(user_agent, header, "Trying Show All User activity failed!")
                res.status(400).send({
                    message: err.message
                })
            })
        } catch (error) {
            UserLog.createLog(user_agent, header, "Failed Try Show All User activity!")
            res.status(500).send({
                message: error.message
            })
        }
    },

    show: async(req, res) => {
        const user_agent = req.headers['user-agent']
        const header = req
        try {
            const id = req.params.id
            await User.findOne({
                include: [
                    {
                        model: Role,
                        attributes: {exclude:[ "createdAt", "updatedAt"]}
                    }
                ],
                attributes: { 
                    exclude: ["roleId", "password", "reset_password", "reset_password_expires", "createdAt", "updatedAt"]
                },
                where: {id: id}
            })
            .then((user) => {
                if (user != null) {
                    UserLog.createLog(user_agent, header, "Showing user by id")
                    res.status(200).send(user)
                } else {
                    res.status(400).send({
                        message: `User data with id=${id} not found`
                    })
                }
            })
            .catch((err) => {
                UserLog.createLog(user_agent, header, "Failed show user by id")
                res.status(500).send({
                    message: err.message
                })
            })
        } catch (error) {
            UserLog.createLog(user_agent, header, "Failed show user by id")
            res.status(500).send({
                message: error.message
            })
        }
    },

    create: async(req, res, next) => {
        const creator = middleware.tokenDecoded(req.headers);
        const user_agent = req.headers['user-agent'];
        const header = req;
        try {
            if (
                !req.body.username ||
                !req.body.email ||
                !req.body.password
            ) {
                res.status(400).send({
                    message: "Username, Email or Password can't be empty!"
                })
            }

            const new_user = {
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10),
                role_id: req.body.role,
                createdBy: creator.id
            }

            // Username check
            User.findOne({
                where: {username: new_user.username}
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
            User.findOne({
                where: {email: new_user.email}
            }).then(user => {
                if (user) {
                    res.status(400).send({
                        message: "Failed! Email is already in use!"
                    });
                    return;
                }
                next();    
            });

            await User.create(new_user)
                .then(() => {
                    UserLog.createLog(user_agent, header, "Success creating new user")
                    res.status(200).send({
                        status: "Success",
                        message: "New user successfully created"
                    })
                })
                .catch((err) => {
                    UserLog.createLog(user_agent, header, "Failed creating new user")
                    res.status(500).send({
                        message:
                            err.message || "Some error occured creating new user!"
                    })
                })
        } catch (error) {
            UserLog.createLog(user_agent, header, "Failed creating new user")
            next(error)
        }
    },

    update: async(req, res, next) => {
        const user_agent = req.headers['user-agent'];
        const header = req;
        try {
            const id = req.params.id
            const user = {
                username: req.body.username,
                email: req.body.email,
                is_active: req.body.is_active,
                password: bcrypt.hashSync(req.body.password, 10),
                role_id: req.body.role
            }

            await User.update(
                user,
                {where: {id: id}}
            )
                .then(() => {
                    UserLog.createLog(user_agent, header, "Success updating user")
                    res.status(200).send({
                        status: "Success",
                        message: "User successfully updated"
                    })
                })
                .catch((err) => {
                    UserLog.createLog(user_agent, header, "Failed updating user")
                    res.status(500).send({
                        message:
                            err.message || "Some error occured updating user!"
                    })
                })
        } catch (error) {
            UserLog.createLog(user_agent, header, "Failed updating user")
            next(error)
        }       
    },
    
    delete: async(req, res) => {
        try {
            const id = req.params.id
            const user_agent = req.headers['user-agent'];
            const header = req;
            await User.destroy({where: {id: id}})
            .then(user => {
                if (user == 1) {
                    UserLog.createLog(user_agent, header, "Success delete user")
                    res.send({
                        message: "User was deleted successfully"
                    })
                } else {
                    res.send({
                        message: `Cannot delete user with id=${id}. Maybe user was not found`
                    })
                }
            })
            .catch(err => {
                UserLog.createLog(user_agent, header, "Failed delete user")
                res.status(403).send({
                    message: "Could not delete user with id= "+id                 
                })
            })
        } catch (error) {
            UserLog.createLog(user_agent, header, "Failed deleting user")
            res.status(500).send({
                message: "Could not delete user"                
            })
        }
    }
}
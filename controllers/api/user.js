const db = require("../../models"),
    User = db.users,
    bcrypt = require("bcryptjs")

module.exports = {
    index: async(req, res) => {
        try {
            await User.findAll({
                attributes: { 
                    exclude: ["password", "createdAt", "updatedAt"]
                }
            })
            .then((users) => {
                if (users.length > 0) {
                    res.status(200).send(users)
                } else {
                    res.status(400).send({
                        message: "User data is empty"
                    })
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message
                })
            })
        } catch (error) {
            res.status(500).send({
                message: error.message
            })
        }
    },

    show: async(req, res) => {
        try {
            const id = req.params.id

            await User.findOne({
                where: {id: id},
                attributes: { 
                    exclude: ["password", "createdAt", "updatedAt"]
                }
            })
            .then((user) => {
                if (user != null) {
                    res.status(200).send(user)
                } else {
                    res.status(400).send({
                        message: `User data with id=${id} not found`
                    })
                }
            })
            .catch((err) => {
                res.status(500).send({
                    message: err.message
                })
            })
        } catch (error) {
            res.status(500).send({
                message: error.message
            })
        }
    },

    create: async(req, res, next) => {
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
                password: bcrypt.hashSync(req.body.password, 10)
            }

            await User.create(new_user)
                .then(
                    res.status(200).send({
                        status: "Success",
                        message: "New user successfully created"
                    })
                )
                .catch((err) => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occured creating new user!"
                    })
                })
        } catch (error) {
            next(error)
        }
    },

    update: async(req, res) => {
        try {
            const id = req.params.id
            const user = {
                username: req.body.username,
                email: req.body.email,
                password: bcrypt.hashSync(req.body.password, 10)
            }

            await User.update(
                user,
                {where: {id: id}}
            )
                .then(
                    res.status(200).send({
                        status: "Success",
                        message: "User successfully updated"
                    })
                )
                .catch((err) => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occured updating user!"
                    })
                })
        } catch (error) {
            next(error)
        }       
    },
    
    delete: async(req, res) => {
        try {
            const id = req.params.id
    
            await User.destroy({where: {id: id}})
            .then(user => {
                if (user == 1) {
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
                res.status(500).send({
                    message: "Could not delete user with id="+id                
                })
            })
        } catch (error) {
            res.status(500).send({
                message: "Could not delete user"                
            })
        }
    }
}
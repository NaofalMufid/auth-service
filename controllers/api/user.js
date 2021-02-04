const db = require("../../models"),
    User = db.users,
    bcrypt = require("bcryptjs")

module.exports = {
    index: async(req, res) => {
        try {
            User.findAll({
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
        
    },

    create: async(req, res) => {
        
    },

    update: async(req, res) => {
        
    },
    
    delete: async(req, res) => {
        
    }
}
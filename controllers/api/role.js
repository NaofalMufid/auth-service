const db = require("../../models"),
    Role = db.roles

module.exports = {
    index: async (req, res) => {
        try {
            await Role.findAll({
                attributes: { 
                    exclude: ["createdAt", "updatedAt"]
                }
            })
            .then((roles) => {
                if (roles.length > 0) {
                    res.status(200).send(roles)
                } else {
                    res.status(400).send({
                        message: "Role data is empty"
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
    
    create: async (req, res, next) => {
        try {
            if (!req.body.name) {
                res.status(400).send({
                    message: "Role name can't be empty!"
                })
            }

            const new_role = {
                name: req.body.name
            }

            // Role Name check
            Role.findOne({
                where: {name: new_role.name}
            }).then(role => {
                if (role) {
                    res.status(400).send({
                        message: "Failed! role name is already in use!"
                    });
                    return;
                }
                next();
            });

            await Role.create(new_role)
                .then(
                    res.status(200).send({
                        status: "Success",
                        message: "New role successfully created"
                    })
                )
                .catch((err) => {
                    res.status(500).send({
                        message:
                            err.message || "Some error occured creating new role!"
                    })
                })
        } catch (error) {
            next(error)
        }
    },
    
    update: async (req, res, next) => {
        try {
            const id = req.params.id
            const role = {
                name: req.body.name
            }

            await Role.update(
                role,
                {where: {id: id}}
            )
            .then(
                res.status(200).send({
                    status: "Success",
                    message: "role successfully updated"
                })
            )
            .catch((err) => {
                res.status(500).send({
                    message:
                        err.message || "Some error occured updating role!"
                })
            })
        } catch (error) {
            next(error)
        }        
    },
    
    delete: async (req, res, next) => {
        try {
            const id = req.params.id
    
            await Role.destroy({where: {id: id}})
            .then(role => {
                if (role == 1) {
                    res.send({
                        message: "role was deleted successfully"
                    })
                } else {
                    res.send({
                        message: `Cannot delete role with id=${id}. Maybe role was not found`
                    })
                }
            })
            .catch(err => {
                res.status(403).send({
                    message: "Could not delete role with id="+id                
                })
            })
        } catch (error) {
            res.status(500).send({
                message: "Could not delete role"                
            })
        }       
    },
}
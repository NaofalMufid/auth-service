var Router = require('express-group-router');
var router = new Router();
var AuthController = require("../controllers/api/auth");
var UserController = require("../controllers/api/user");
var RoleController = require("../controllers/api/role");
var middleware = require('../middlewares/middleware');


module.exports = (app) => {
  // auth route
  router.post('/register', AuthController.register);
  router.post('/login', AuthController.login);
  router.post('/forgot_password', AuthController.forgot_password);
  router.post('/reset_password', AuthController.reset_password);

  
  router.group([middleware.verifyToken], (router) => {
    // users route
    router.get("/users", UserController.index);
    router.get("/user/:id", UserController.show);
    router.post("/users", UserController.create);
    router.put("/user/:id", UserController.update);
    router.delete("/user/:id", UserController.delete);
    // roles route
    router.get("/roles", RoleController.index);
    router.post("/roles", RoleController.create);
    router.put("/role/:id", RoleController.update);
    router.delete("/role/:id", RoleController.delete);
  })

  const listRoutes = router.init();
  app.use("/api/", listRoutes);
}

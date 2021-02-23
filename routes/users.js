var Router = require('express-group-router');
var router = new Router();
var AuthController = require("../controllers/api/auth");
var UserController = require("../controllers/api/user");
var RoleController = require("../controllers/api/role");
var UserLogController = require("../helper/user-log");
var middleware = require('../middlewares/middleware');


module.exports = (app) => {
  // auth route
  router.post('/register', AuthController.register);
  router.post('/login', AuthController.login);
  router.post('/newtoken', AuthController.newToken);
  router.post('/forgot_password', AuthController.forgot_password);
  router.post('/reset_password', AuthController.reset_password);
  // verification account
  router.post("/confirmation", AuthController.confirmationAccount);
  router.post("/resend-confirmation", AuthController.resendConfirmation);
  
  router.get("/listlog", UserLogController.userLogList);

  router.group([middleware.verifyToken(['admin','nonadmin'])], (router) => {
    router.get("/users", UserController.index);
  })
  router.group([middleware.verifyToken(['admin'])], (router) => {
    // users route
    router.get("/user/:id", UserController.show);
    router.post("/users", UserController.create);
    router.put("/user/:id", UserController.update);
    router.delete("/user/:id", UserController.delete);
    // roles route
    router.get("/roles", RoleController.index);
    router.post("/roles", RoleController.create);
    router.put("/role/:id", RoleController.update);
    router.delete("/role/:id", RoleController.delete);

    // user log
    router.get("/logs", UserLogController.userLogList);
  })

  const listRoutes = router.init();
  app.use("/api/", listRoutes);
}

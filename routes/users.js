var Router = require('express-group-router');
var router = new Router();
var AuthController = require("../controllers/api/auth");
var UserController = require("../controllers/api/user");


module.exports = (app) => {
  router.post('/register', AuthController.register);
  router.post('/login', AuthController.login);

  router.get('/forgot_password', AuthController.forgot_password_template);
  router.post('/forgot_password', AuthController.forgot_password);

  router.get('/reset_password', AuthController.reset_password_template);
  router.post('/reset_password', AuthController.reset_password);

  router.group( (router) => {
    router.get("/users", UserController.index);
    router.get("/user/:id", UserController.show);
  })

  const listRoutes = router.init();
  app.use("/api/", listRoutes);
}

# AUTH SERVICE
 **Simple Auth Service (login, register, forgot password, crud user)**

### Stack
- nodejs (express)
- postgresql
- sequelize
- jsonwebtoken
- nodemailer

### List Auth Service API  :

1. Auth
    - ```/api/register``` {POST, body [email, username, password]}
    - ```/api/login``` {POST, body [email, password]}
    - ```/api/forgot_password``` {POST, body [email]}
    - ```/api/reset_password``` {POST, body [resetToken, newPassword, verifyPassword]}

2. User
    - ```/api/users``` {GET, fetch all users}
    - ```/api/users``` {POST, body [username, email,password, role]}
    - ```/api/user/:id``` {GET, params[id], fetch user by id}
    - ```/api/user/:id``` {PUT, params[id], body[email, username, password, is_active, role]}
    - ```/api/user/:id``` {DELETE, params[id]}

3. Role
    - ```/api/roles``` {GET, fetch all role}
    - ```/api/roles``` {POST, body [name]}
    - ```/api/role/:id``` {PUT, params[id], body[name]}
    - ```/api/role/:id``` {DELETE, params[id]}

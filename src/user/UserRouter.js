const express = require('express');
const router = express.Router();
const UserService = require('./UserService');

router.post('/api/1.0/users', async (req, res) => {
  try {
    await UserService.save(req.body);
    return res.status(200).send({ message: 'User created' });
  } catch (error) {
    return res.status(500).send({ message: 'Error created user' || error.message });
  }
});

module.exports = router;

const request = require('supertest');
const app = require('../src/app');
const User = require('../src/user/User');
const sequelize = require('../src/config/database');

beforeAll(() => {
  return sequelize.sync();
});

beforeEach(() => {
  return User.destroy({ truncate: true });
});

describe('User Registration', () => {
  const postValidUser = () => {
    return request(app).post('/api/1.0/users/').send({
      username: 'namao',
      email: 'user@mail.com',
      password: '123456',
    });
  };

  it('return 200 ok when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.status).toBe(200);
  });

  it('return success message when signup request is valid', async () => {
    const response = await postValidUser();
    expect(response.body.message).toBe('User created');
  });

  it('save the users to database', async () => {
    await postValidUser();
    const data = await User.findAll();
    expect(data.length).toBe(1);
  });

  it('save the username and email to database', async () => {
    await postValidUser();
    const data = await User.findAll();
    const userData = data[0];
    expect(userData.username).toBe('namao');
    expect(userData.email).toBe('user@mail.com');
  });

  it('hashing passsword', async () => {
    await postValidUser();
    const data = await User.findAll();
    const userData = data[0];
    expect(userData.password).not.toBe('123456');
  });
});

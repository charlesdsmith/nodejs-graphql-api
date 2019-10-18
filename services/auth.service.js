const jwt = require('jsonwebtoken');

//TEMP CHANGE THIS ON PRODUCTION
process.env.JWT_SECRET = 'verysecret';
const secret = process.env.NODE_ENV === 'production' ? process.env.JWT_SECRET : 'secret';

module.exports = {
  issue: (payload) => jwt.sign(payload, secret, { expiresIn: 10800 }),
  verify: (token, cb) => jwt.verify(token, secret, {}, cb),
};

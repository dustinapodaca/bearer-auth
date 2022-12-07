'use strict';

const base64 = require('base-64');
const { users } = require('../models/index.js');

module.exports = async (req, res, next) => {

  if (!req.headers.authorization) { next('Invalid Sign Up'); }
  console.log('req.headers.authorization', req.headers.authorization);
  let basicEncodedString = req.headers.authorization.split(' ').pop();
  console.log('basicEncodedString', basicEncodedString);
  let [username, password] = base64.decode(basicEncodedString).split(':');
  console.log('username', username);
  console.log('password', password);
  if (username && password) {
    try {
      req.user = await users.authenticateBasic(username, password);
      next();
    } catch (e) {
      console.error(e);
      res.status(403).send('Invalid Login');
    }
  }
};

'use strict';

const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SECRET = process.env.SECRET || 'TEST_SECRET';

const userSchema = (sequelize, DataTypes) => {
  const model = sequelize.define('User', {
    username: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    token: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, SECRET, {
          algorithm: 'HS256',
          expiresIn: 1000 * 60 * 15,
        });
      },
      set() {
        return jwt.sign({ username: this.username }, SECRET, {
          algorithm: 'HS256',
          expiresIn: 1000 * 60 * 15,
        });
      },
    },
    refreshToken: {
      type: DataTypes.VIRTUAL,
      get() {
        return jwt.sign({ username: this.username }, SECRET, {
          algorithm: 'HS256',
          expiresIn: 1000 * 60 * 60 * 24 * 30,
        });
      },
      set() {
        return jwt.sign({ username: this.username }, SECRET, {
          algorithm: 'HS256',
          expiresIn: 1000 * 60 * 60 * 24 * 30,
        });
      },
    },
  });

  model.beforeCreate(async (user) => {
    let hashedPass = await bcrypt.hash(user.password, 6);
    user.password = hashedPass;
    return user;
  });

  // Basic AUTH: Validating strings (username, password)
  model.authenticateBasic = async function (username, password) {
    const user = await this.findOne({ where: { username } } );
    console.log('user', user.password);
    const valid = await bcrypt.compare(password, user.password);
    if (valid) { return user; }
    throw new Error('Invalid User');
  };

  // Bearer AUTH: Validating a token
  model.authenticateWithToken = async function (token) {
    try {
      const parsedToken = jwt.verify(token, SECRET);
      const user = this.findOne({ where: { username: parsedToken.username } });
      if (user) { return user; }
      throw new Error('User Not Found');
    } catch (e) {
      throw new Error(e.message);
    }
  };

  return model;
};

module.exports = userSchema;

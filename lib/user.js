const fs = require('fs');
const User = require('./../models/users');
const shortid = require('shortid');


const isValidEmail = (email) => {
  return new Promise((resolve, reject) => {
    User.findOne({ email }, (err, user) => {
      if (err) return reject(err);
      return resolve(user === null);
    });
  });
}

const createUser = ({ email, password }) => {
  const user = {
    email,
    password,
    path: shortid.generate(),
    chatrooms: ['broadcast'],
  };
  return new Promise((resolve, reject) => {
    User.create(user, (err, data) => {
      if (err) return reject(err);
      console.log(data);
      return resolve(data);
    });
  });
}

const findUser = ({email, password}) => {
  return new Promise((resolve, reject) => {
    User.findOne({email, password}, (err, user) => {
      if (err) return reject(err);
      return resolve(user);
    });
  });
}

module.exports = {
  isValidEmail,
  createUser,
  findUser,
};

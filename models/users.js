const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({ 
  email: {
    type: 'string',
    required: true,
  },
  password: {
    type: 'string',
    required: true,
  },
  path: 'string',
  chatrooms: 'array',
  // containers: 'array',
});

const User = mongoose.model('User', userSchema);


module.exports = User;

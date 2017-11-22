const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const chatSchema = new Schema({ 
  name: 'string', // socket room name
  users: 'array',
  messages: 'array',
  // container: 'string',
  // path: 'string',
});

const Chat = mongoose.model('Chat', chatSchema);


module.exports = Chat;

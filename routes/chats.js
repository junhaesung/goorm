const express = require('express');
const router = express.Router();
const { authForAPI } = require('./../lib/auth');
const shortid = require('shortid');
const Chat = require('./../models/chats');
const User = require('./../models/users');

/**
 * 채팅 보내기
 */
router.post('/:roomName/messages', authForAPI, (req, res, next) => {
  // const id = req.session.email;
  const { roomName } = req.params;
  const timestamp = new Date();

  console.log(timestamp.toDateString());
  console.log(timestamp.getHours());
  console.log(timestamp.getMinutes());
  console.log(timestamp.getSeconds());

  // 전체 유저 채팅방
  // 또는 특정 유저와의 1대1 채팅방
  const destination = req.body.destination;

  res.sendStatus(200);
});

/**
 * 채팅 방 만들기
 */
router.post('/', authForAPI, async (req, res, next) => {
  try {
    const users = [];
    users.push(req.session.email);
    // TODO: destination valiate;
    users.push(req.body.destination);

    const chatroomName = await createChat(users);
    // user마다 chatroom에 id넣기
    for (let user of users) {
      await addChatroom(user, chatroomName);
    }
    res.status(201).send(chatroomName);
  } catch (err) {
    res.status(err.code || 500).send(err.message);
  }
});

const createChat = (users) => {
  const chat = {
    users,  // 참여하는 사용자들
    name: shortid.generate(), // 소켓에서 쓸 채팅방 이름
    messages: [],
  };
  return new Promise((resolve, reject) => {
    Chat.create(chat, (err) => {
      if (err) return reject(err);
      return resolve(chat.name);
    });
  });
}

function addChatroom(email, chatroomName) {
  console.log(email);
  return new Promise((resolve, reject) => {
    User.findOne({
      email
    }, (err, user) => {
      if (err) return reject(err);
      if (!user) return reject(new Error('User not found'));

      user.chatrooms.push(chatroomName);
      user.save(err => {
        if (err) return reject(err);
        return resolve();
      });
    });
  });
}

/**
 * 채팅방 이름으로 조회하기
 */
router.get('/:roomName', authForAPI, async (req, res, next) => {
  try {
    const name = req.params.roomName;
    if (!name) throw new PreconditionError('name required');
    const chat = await readChat(name);
    if (!chat) res.sendStatus(204);
    res.status(200).json(chat);
  } catch(err) {
    res.status(err.code || 500).send(err.message);
  }
  
});

function readChat(name) {
  return new Promise((resolve, reject) => {
    Chat.findOne({
      name,
    }, (err, chat) => {
      if (err) return reject(err);
      // chat.messages = [1,2,3,4,5,6,7,8,9,10];
      return resolve(chat);
    });
  });
}


module.exports = router;
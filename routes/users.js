const express = require('express');
const router = express.Router();
// db
const mongoose = require('mongoose');
const User = require('./../models/users');
const fs = require('fs');
const { auth, authForAPI } = require('./../lib/auth');
const { PreconditionError } = require('./../lib/error');
const { files, makeDirectory } = require('./../lib/file');
const {
  isValidEmail,
  createUser,
  findUser,
} = require('./../lib/user');

/* GET users listing. */
router.get('/', (req, res, next) => {
  const session = req.session;
  console.log(session);
  res.send('respond with a resource');
});

/**
 * 회원가입
 */
router.post('/', async (req, res, next) => {
  try {
    // 입력값 검증
    // id, password 필드가 비어있으면
    // 형식 제한 (id) - email
    // 형식 제한 (password)
    // 글자 수 제한 (id)
    // 글자 수 제한 (password)
    // password가 조건에 맞지 않으면 예외처리

    // db 검증, 이미 id가 있으면 예외처리
    if ((await isValidEmail(req.body.email)) === false) {
      throw new PreconditionError('Invalid Email');
    }

    const { email, password } = req.body;

    // id , password 가 조건을 만족하면 ok

    // db에 user 생성
    const user = await createUser({ email, password });
    // 세션 추가
    req.session.id = user._id;
    req.session.email = user.email;
    req.session.path = user.path;
    // 유저 폴더 만들기
    await makeDirectory(`./uploads/${user.path}`);
    res.redirect('/main');
  } catch (e) {
    res.status(e.code || 500).json({
      name: e.name,
      message: e.message,
    });
  }
});

/**
 * login user
 */
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // TODO: email, password validate

    const user = await findUser({ email, password });
    if (user === null) {
      // login 실패, id, password 확인해주세요
      throw new PreconditionError('login failed');
    }
    // 세션 id 담아서 보내주기 
    req.session.id = user._id;
    req.session.email = email;
    req.session.path = user.path;
    await makeDirectory(`./uploads/${user.path}`);
    res.redirect('/main');
  } catch (err) {
    res.status(err.code || 500).json(err);
  }
});

/**
 * logout user
 */
router.post('/logout', auth, (req, res, next) => {
  req.session.destroy((err) => {
    // cannot access session here
    console.log('session deleted');
  });
  // req.session.destory();  // 세션 삭제
  // res.clearCookie(sessionID); // 세션 쿠키 삭제
  res.redirect('/');
});

/**
 * 자기자신이 속한 채팅 룸 목록 가져오기
 */
router.get('/chatrooms', authForAPI, async (req, res, next) => {
  try {
    const results = await getChatrooms(req.session.email);
    console.log(results);
    if (!results) return res.sendStatus(204);
    res.status(200).send(results);
  } catch(err) {
    res.status(err.code || 500).send(err.message);
  }
});

const getChatrooms = (email) => {
  const user = {
    email,
  };
  return new Promise((resolve, reject) => {
    User.findOne(user, (err, data) => {
      if (err) return reject(err);
      console.log(data);
      return resolve(data.chatrooms);
    });
  });
}

module.exports = router;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const _ = require('lodash');
const { auth } = require('./../lib/auth');
const { getFiles } = require('./../lib/file');

/* GET home page. */
router.get('/', (req, res, next) => {
  if (req.session.email) return res.redirect('/main');
  res.render('index');
});

/**
 * GET signup page
 */
router.get('/signup', (req, res, next) => {
  if (req.session.email) return res.redirect('/main');
  res.render('signup');
})

/**
 * GET main page
 */
router.get('/main', auth, async (req, res, next) => {
  try {
    const files = await getFiles(req.session.path);
    res.render('main', {
      files,
      user: req.session.email,
      currentFile: '',
      content: '',
    });
  } catch(error) {
    error.status = '';
    res.render('error', { error });
  }
});


module.exports = router;

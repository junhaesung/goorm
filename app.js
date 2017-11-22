const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const bodyParser = require('body-parser');
const session = require('express-session');
const mongoose = require('mongoose');
const mongodbURL = require('./config/config.json').mongodbURL;
// const mongodbURL = 'mongodb://localhost'
mongoose.connect(mongodbURL, { useMongoClient: true });
mongoose.Promise = global.Promise;

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
// db.once('open', () => {});

const index = require('./routes/index');
const users = require('./routes/users');
const files = require('./routes/files');
const chats = require('./routes/chats');

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(express.static(path.join(__dirname, 'public')));

// session
app.use(session({
  secret: '!s@e#s$s%i^o&n*s(e)c_r+e~t',
  resave: false,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000 * 100,   // 쿠키 유효기간
  },
}));

// routing
app.use('/', index);
app.use('/files', files);
app.use('/users', users);
app.use('/chats', chats);
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

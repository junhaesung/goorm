/**
 * 세션 없으면 리다이렉트
 */
const auth = (req, res, next) => {
  if (req.session.id) {
    next();
  } else {
    res.redirect('/');
  }
}

/**
 * 세션 없으면 에러코드
 */
const authForAPI = (req, res, next) => {
  if (req.session.id) {
    next();
  } else {
    res.sendStatus(401);
  }
}


module.exports = {
  auth,
  authForAPI,
};
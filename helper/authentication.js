const { sign } = require('jsonwebtoken');

const createAccessToken = (username) => sign({ username }, process.env.ACCESS_TOKEN_SECRET, {
  expiresIn: '15m',
});

const createRefreshToken = (username) => sign({ username }, process.env.REFRESH_TOKEN_SECRET, {
  expiresIn: '7d',
});

const sendAccessToken = (res, req, token) => (
  res.send({
    token,
    username: req.body.username,
  })
);

const sendRefreshToken = (res, token) => (
  res.cookie('refreshToken', token, {
    httpOnly: true,
    path: '/',
  })
);

module.exports = {
  createAccessToken,
  createRefreshToken,
  sendAccessToken,
  sendRefreshToken,
};

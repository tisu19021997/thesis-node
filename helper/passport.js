const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const { ExtractJwt } = require('passport-jwt');
const { Strategy } = require('passport-local');
const bcrypt = require('bcrypt');
const User = require('../models/user');

// passport configuration methods
passport.serializeUser((user, cb) => {
  cb(null, user.username);
});

passport.deserializeUser((username, cb) => {
  User.find({ username }, (err, user) => {
    if (err) {
      return cb(err);
    }

    return cb(null, user);
  });
});


// passport strategies
const jwtOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: process.env.ACCESS_TOKEN_SECRET || 'bluedarkgreengray',
};

passport.use('jwt-user', new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  User.findOne({ username: jwtPayload.username }, (err, user) => {
    if (err) {
      return done(err, false);
    }
    if (user) {
      return done(null, user);
    }
    return done(null, false);
  });
}));

passport.use('jwt-admin', new JwtStrategy(jwtOptions, (jwtPayload, done) => {
  User.findOne({ username: jwtPayload.username }, (err, user) => {
    if (err) {
      return done(err, false);
    }

    if (user.role === 'admin') {
      return done(null, user);
    }

    return done(null, false);
  });
}));

passport.use('local-login', new Strategy(
  ((username, password, cb) => User.findOne({ username }, (err, user) => {
    if (err) {
      return cb(err);
    }

    if (!user) {
      return cb(null, false, { message: 'Incorrect username.' });
    }

    bcrypt.compare(password, user.password, (error, res) => {
      if (error) {
        return cb(error);
      }

      if (res === true) {
        return cb(null, user);
      }

      return cb(null, false);
    });

    return false;
  })),
));

passport.use('local-signup', new Strategy({ passReqToCallback: true },
  ((req, username, password, cb) => {
    User.findOne({ username }, (err, user) => {
      if (err) {
        return cb(err);
      }

      if (user) {
        return cb(null, { message: `The username '${username}' you registered is already taken` });
      }

      // using bcrypt to hash the password
      bcrypt.hash(password, 10, (error, hash) => {
        if (error) {
          return cb(err);
        }

        return cb(null, {
          others: req.body,
          username,
          password: hash,
        });
      });
    });
  })));

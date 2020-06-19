/* eslint-disable import/no-extraneous-dependencies */
require('dotenv/config');
require('./helper/passport');
const createError = require('http-errors');
const cors = require('cors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const session = require('express-session');
const mongoose = require('mongoose');

// authentication
const passport = require('passport');

const homeRouter = require('./routes/home');
const productRouter = require('./routes/product');
const categoryRouter = require('./routes/category');
const userRouter = require('./routes/user');
const manageRouter = require('./routes/manage');
const transactionRouter = require('./routes/transaction');
const ratingRouter = require('./routes/rating');
// const trainRouter = require('./routes/train');
// const testRouter = require('./routes/test');

const app = express();

// database
const db = mongoose.connection;

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8081);

// use application-level middleware for common functionality, including
// logging, parsing, and session handling.
app.use(logger('dev'));

// allow all origins
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.101:3000'],
  credentials: true,
}));
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true,
//   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
//   preflightContinue: false,
//   optionsSuccessStatus: 200,
// }));

app.use(cookieParser());
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.urlencoded({
  extended: true,
  limit: '50mb',
}));
app.use(bodyParser.json({ limit: '50mb' }));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
}));
app.use(express.static(path.join(__dirname, 'public')));

// initialize Passport and restore authentication state, if any, from the
// session.
app.use(passport.initialize({}));
app.use(passport.session({}));

// routes set up
app.use('/api/v1', homeRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/categories', categoryRouter);
app.use('/api/v1/ratings', ratingRouter);
app.use('/api/v1/users',
  passport.authenticate('jwt-user', { session: false }),
  userRouter);
app.use('/api/v1/transactions',
  passport.authenticate('jwt-user', { session: false }),
  transactionRouter);
app.use('/api/v1/store-management', passport.authenticate('jwt-admin', { session: false }),
  manageRouter);
// app.use('/recommendation', trainRouter);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404));
});

// error handler
app.use((err, req, res) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log(`Start on port ${app.get('port')}`);
});

// mongodb connection
mongoose.set('useFindAndModify', false);

// This database contains messy data. Although, it may be useful in the future, I will keep it.
// mongoose.connect('mongodb://localhost/thesis', {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// New database contains only users, products, and ratings which are
// from the train set of the recommendation system model.
mongoose.connect('mongodb://localhost/thesis_v2', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.on('err', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to database');
});


module.exports = app;

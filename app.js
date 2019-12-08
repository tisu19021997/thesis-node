/* eslint-disable import/no-extraneous-dependencies */
require('dotenv')
  .config();
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
app.use(cors({
  origin: '*',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
}));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
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


app.use('/', homeRouter);
app.use('/product', productRouter);
app.use('/categories', categoryRouter);
app.use('/user', userRouter);

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
mongoose.connect('mongodb://localhost/thesis', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.on('err', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to database');
});


module.exports = app;

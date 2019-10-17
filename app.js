/* eslint-disable import/no-extraneous-dependencies */
require('dotenv').config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const logger = require('morgan');
const mongoose = require('mongoose');

const homeRouter = require('./routes/home.index');
const usersRouter = require('./routes/users');

const app = express();

// database
const db = mongoose.connection;


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('port', process.env.PORT || 8081);

app.use(logger('dev'));
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', homeRouter);
app.use('/users', usersRouter);

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

/*
mongoose.connect('mongodb://localhost/thesis', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

db.on('err', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to database');
});
*/

module.exports = app;

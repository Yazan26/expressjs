var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var httplogger = require('morgan');
var favicon = require('serve-favicon');


var indexRouter = require('./src/routes/index.route');
var usersRouter = require('./src/routes/users.route');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

app.use(httplogger('dev'));
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use('/bootstrap', express.static(require('path').join(__dirname, 'node_modules/bootstrap/dist')));
app.use('/', indexRouter);
app.use('/users', usersRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

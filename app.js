var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var httplogger = require('morgan');
var favicon = require('serve-favicon');
var dotenv = require('dotenv').config();
const session = require('express-session');

// Import error handling middleware
const { globalErrorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

var indexRouter = require('./src/routes/index.route');
var usersRouter = require('./src/routes/users.route');
var authRouter = require('./src/routes/auth.route');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

app.use(httplogger('combined'));
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use('/bootstrap', express.static(require('path').join(__dirname, 'node_modules/bootstrap/dist')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'sakila-video-store-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
    },
    name: 'sakila.session.id'
  })
);

// User session middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.authenticated = !!req.session.user;
  next();
});

// Route handlers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;

var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var favicon = require('serve-favicon');
var dotenv = require('dotenv').config();
const session = require('express-session');
const flash = require('connect-flash');

// Import enhanced logging middleware
const requestLogger = require('./src/middleware/requestLogger');
const logger = require('./src/util/logger');

// Import error handling middleware
const { globalErrorHandler, notFoundHandler } = require('./src/middleware/errorHandler');

var indexRouter = require('./src/routes/index.route');
var usersRouter = require('./src/routes/users.route');
var authRouter = require('./src/routes/auth.route');

// Import new route handlers
var filmsRouter = require('./src/routes/films.route');
var customerRouter = require('./src/routes/customer.route');
var staffRouter = require('./src/routes/staff.route');
var adminRouter = require('./src/routes/admin.route');
var reportsRouter = require('./src/routes/reports.route');
var aboutRouter = require('./src/routes/about.route');
var storiesRouter = require('./src/routes/stories.route');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

// Use enhanced request logging instead of Morgan
app.use(requestLogger);
app.use(favicon(path.join(__dirname, 'favicon.ico')));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src', 'public')));
app.use('/bootstrap', express.static(require('path').join(__dirname, 'node_modules/bootstrap/dist')));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || 'movies-express-rentals-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true
    },
    name: 'moviesexpressrentals.session.id'
  })
);

// Flash messages middleware
app.use(flash());

// User session middleware
app.use((req, res, next) => {
  res.locals.user = req.session.user;
  res.locals.authenticated = !!req.session.user;
  res.locals.req = req; // Make request object available to templates
  next();
});

// Route handlers
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

// New feature routes
app.use('/films', filmsRouter);
app.use('/customer', customerRouter);
app.use('/staff', staffRouter);
app.use('/admin', adminRouter);
app.use('/reports', reportsRouter);
app.use('/about', aboutRouter);
app.use('/stories', storiesRouter);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(globalErrorHandler);

module.exports = app;

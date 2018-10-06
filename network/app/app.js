var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var app = express();
var bodyParser = require('body-parser');

// Body Parser config
app.use(bodyParser.urlencoded({ 
  extended: true, 
  limit: '50mb', 
  parameterLimit: 1000000
}));
app.use(bodyParser.json());

// Routing
var router = require('./routes/router');
app.use('/api', router);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  console.log('Error :(', err.message);
  var errMsg = "Error: " + err.message;

  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  //res.status(err.status);
  //res.render('error');

  // Return API error message
  errMsg = toErrorMsg(errMsg);
  res.send(errMsg);
});

var errorHandler = function(err, req, res, next){
  console.log(err.stack);
};

var toErrorMsg = function (errMsg) {
  var _errMsg = errMsg.split(':');



  var HTTP_Response = {
    error: _errMsg[1].trim()
  };
  return JSON.stringify(HTTP_Response);
};

app.use(errorHandler);

// CORS Headers
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

module.exports = app;
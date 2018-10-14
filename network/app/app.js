const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const https = require('https');
const fs = require('fs');

//CORS middleware
var allowCrossDomain = function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With, Accept');

  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
      res.send(200);
  } else {
      next();
  }
};
app.use(allowCrossDomain);


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

// Certificate
const privateKey = fs.readFileSync('/etc/letsencrypt/live/api.jukeblox.io/privkey.pem', 'utf8');
const certificate = fs.readFileSync('/etc/letsencrypt/live/api.jukeblox.io/fullchain.pem', 'utf8');
const ca = fs.readFileSync('/etc/letsencrypt/live/api.jukeblox.io/fullchain.pem', 'utf8');

const credentials = {
	key: privateKey,
	cert: certificate,
	ca: ca
};

// Starting both http & https servers
const httpServer = http.createServer(app);
//const httpsServer = https.createServer(credentials, app);

httpServer.listen(80, () => {
	console.log('HTTP Server running on port 80');
});

httpsServer.listen(443, () => {
	console.log('HTTPS Server running on port 443');
});

module.exports = app;
const http_client = require('request');
const express = require('express');
const router = express.Router();
const path = require('path');
const exec = require('child_process').exec;
const util = require('util');
const fs = require('fs');

// Crypto
const crypto = require('crypto');

// Multer multi-part encoding
const multer = require('multer');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    /*crypto.pseudoRandomBytes(16, function (err, raw) {
      if (err) return cb(err)

      cb(null, raw.toString('hex') + path.extname(file.originalname))
    })*/
    cb(null, 'jukeblox' + path.extname(file.originalname))
  }
});

const uploads = multer({ storage: storage });

// Formidable
const formidable = require('express-formidable');
var app = express();
app.use(formidable());

// Swarm
try {
  web3.bzz.setProvider('http://localhost:8500');
} catch (e) {
  if (e.hasOwnProperty('message')) {
    console.log('Error connecting to Swarm', e.message);
  } else {
    console.log('Error connecting to Swarm', e);
  }
}

// Swarm API

/**
 * Uploads an mp3 file to Swarm and creates a servable Swarm asset in /public
 * @section Swarm
 * @type POST
 * @url POST: /api/swarm/upload
 * @param {Object} file - Multipart encoded file object.
 */
router.post('/swarm/upload', uploads.any(), (request, response) => {
  // Ensure valid JSON header
  response.header('Content-Type', 'application/json');

  const params = request.body;
  // BELOW WILL BE HUGE, UNCOMMENT AT YOUR OWN RISK xD
  //console.log('PARAMS',params);

  var res,
      errMsg,
      errType = "POST: /swarm/upload",
      filename,
      file_path,
      file_size,
      file_type,
      file_full_path,
      swarm_hash;

  console.log('files',request.files);

  /*
  files [ { fieldname: 'file',
    originalname: 'mdmalways.mp3',
    encoding: '7bit',
    mimetype: 'audio/mp3',
    destination: './uploads/',
    filename: 'c9047d27a88cabb7c30f17a7f0ee5b23.mp3',
    path: 'uploads/c9047d27a88cabb7c30f17a7f0ee5b23.mp3',
    size: 6018354 } ]
  */
  if (request.files) {
    if (request.files.length) {
      file_path = request.files[0].path;
      file_type = request.files[0].mimetype;
      filename = request.files[0].filename;
      original_filename = request.files[0].originalname;
      file_full_path = request.files[0].destination + request.files[0].filename;
      // Debug
      var debug = [file_path, file_type, filename, file_full_path];
      console.log('debug', debug);
    } else {
      errMsg = "Error: Invalid or missing file";
    }

    if (file_type) {
      if (file_type !== 'audio/mp3') {
        errMsg = "Error: Invalid file type";
      }
    } else {
      errMsg = "Error: Unknown file type";
    }

  } else {
    errMsg = "Error: Invalid or missing file";
  }

  if (!errMsg) {
    // Swarm up
    let swarm_up = 'swarm up ' + file_full_path; 
    exec(swarm_up, (error, stdout, stderr) => {
      if (error !== null) {
        console.log(`exec error: ${error}`);
        errMsg = "Error: " + error;
        errMsg = toErrorMsg(errMsg);
        console.log([errType, errMsg]);
        response.send(errMsg);
      } else if (stderr) {
        errMsg = "Error: " + stderr;
      } else {
        swarm_hash = stdout.trim();
        if (!errMsg) {
          // Send server response
          res = {
            http: {
              status: "200",
              msg: "Successfully uploaded file " + original_filename + " to Swarm hash: " + swarm_hash
            },
            data: {
              swarm: {
                storage_hash: swarm_hash,
                storage_link: 'bzz:/' + swarm_hash + '/jukeblox.mp3'
              }
            }
          }
          // Do send server response
          response.send(JSON.stringify(res));
          
          // Delete posted file
          if (fs.existsSync(file_full_path)) {
            fs.unlink(file_full_path, (err) => {});
          }

          // Create directory based on swarm hash
          if (!fs.existsSync('public/' + swarm_hash)){
            fs.mkdirSync('public/' + swarm_hash);
          }

          // Download and start serving the file
          let swarm_down = 'swarm down bzz:/' + swarm_hash;
          exec(swarm_down, (error, stdout, stderr) => {
            console.log('Swarm down successful');
            fs.rename(swarm_hash, 'public/' + swarm_hash + '/jukeblox.mp3', (err) => {
              if (err) {
                console.log('Error moving file', err);
              } else {
                console.log('File now being served from ./public');
              }
            });
          });
        } else {
          // Send error response
          errMsg = toErrorMsg(errMsg);
          console.log([errType, errMsg]);
          response.send(errMsg);
        }
      }
    });
  } else {
    // Send error response
    errMsg = toErrorMsg(errMsg);
    console.log([errType, errMsg]);
    response.send(errMsg);
  }
});

// EXTERNAL / UTILITY FUNCTIONS

toErrorMsg = function (errMsg) {
  var _errMsg = errMsg.split(':');
  var HTTP_Response = {
    error: _errMsg[1].trim()
  };

  return JSON.stringify(HTTP_Response);
};

module.exports = router;

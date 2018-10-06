var http_client = require('request');
var express = require('express');
var router = express.Router();

// Web3
var Web3 = require('web3');
var web3 = new Web3('http://localhost:8545');

// Nodes
const node = 'http://localhost:8545';
const swarm_node = 'http://localhost:8500/bzz:/';

// IPC
//var ipcPath = process.env['HOME'] + '/.local/share/io.parity.ethereum/jsonrpc.ipc';
//var ipcProvider = provider = new web3.providers.IpcProvider(ipcPath, net);

// File System
var fs = require('fs');

// Crypto
var crypto = require('crypto');

// Formidable
var formidable = require('formidable');

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

// Database
//var mongoose = require('mongoose');
//var mongoUrl = 'mongodb://localhost:27017/jukebox';
//var connection = mongoose.createConnection(mongoUrl);


// Accepted file extensions
// XXX TODO: Tighten this up?
const swarm_approved_file_extensions = ['.mp3'];

/**
 * Request block data from a transaction hash. For example, can be used to get a contract address from a transaction hash. Or to check if a transaction has been already mined.
 * 
 * <h5 style="margin-top:4px;margin-bottom:4px">Params:</h5>
 * 
 * <pre>
 * {String} tx - The transaction hash of the target block you are requesting data for.
 * </pre>
 * 
 * <h5 style="margin-top:4px;margin-bottom:4px">Example Request:</h5>
 * 
 * <pre>
 * {
 *    "tx": "0xd4b6198151e4be95e5bf4b53bd563990d8c0e559eb1f0ee4b9c6b66775021018"
 * }
 * </pre>
 * 
 * <h5 style="margin-top:4px;margin-bottom:4px">Example Response:</h5>
 * 
 * <pre>
 * {  
 *   "http":{  
 *   "status":"200",
 *   "msg":"200 OK"
 * },
 * "data":{
 *   // lots of block data :)
 *   // ...
 * }
 * </pre>
 * 
 * @section Transactions
 * @type POST
 * @url POST: /api/transaction/hash
 * @param {String} tx - The hash (tx hash) of the target transaction for which to receive block data.
 */
router.post('/transaction/hash', function(request, response) {
  // Ensure valid JSON header
  response.header('Content-Type', 'application/json');

  const params = request.body;

  var res,
      txData = null,
      errMsg,
      errType = "POST: /transaction/hash";


  // Detect missing req. parameters
  if ( Object.keys(params).length === 0 && params.constructor === Object ) {
    errMsg = "Error: Post body is empty.";
  } else if ( !params.hasOwnProperty('tx') ) {
    errMsg = "Error: An Organziation ID is required.";
  }

  if (!errMsg) {
    txData = web3.eth.getTransaction(params.tx);
    txData.then(function (_txData) {
      console.log('txData', txData);
      // Process response / API output
      if (errMsg) {
        errMsg = toErrorMsg(errMsg);
        console.log([errType, errMsg]);
        response.send(errMsg);
      } else {
        res = {
          http: {
            status: "200",
            msg: "200 OK"
          },
          data: _txData
        }
        response.send(JSON.stringify(res));
      }
    });
  } else {
    errMsg = toErrorMsg(errMsg);
    console.log([errType, errMsg]);
    response.send(errMsg);
  }

});

// Swarm API

/**
 * Uploads a file to Swarm and creates relative attachment linkage to campaign. For now, the following file extensions are accepted: .mp3
 * @section Swarm
 * @type POST
 * @url POST: /api/swarm/upload
 * @param {Object} file - Multipart encoded file object.
 */
// XXX TODO: Add more control parameters to mime type and file extension restrictions
router.post('/swarm/upload', function(request, response) {
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
      file_type;

    // XXX TODO: Parse file name and path
    var form = new formidable.IncomingForm();
    
    // Formidable settings
    form.keepExtensions = true;

    // Parse upload target
    form.parse(request, function(err, fields, file) {
      if (!file.hasOwnProperty('fileUploaded')) {
        errMsg = "Error: problem parsing uploaded file, 'fileUploaded' object invalid or not found";
      }
      if (!file.fileUploaded.hasOwnProperty('size')) {
        errMsg = "Error: problem parsing uploaded file, file size invalid or not found";
      }
      if (!file.fileUploaded.hasOwnProperty('name')) {
        errMsg = "Error: problem parsing uploaded file, filename invalid or not found";
      }
      if (!file.fileUploaded.hasOwnProperty('type')) {
        errMsg = "Error: problem parsing uploaded file, file extension invalid or not found";
      }
      if (!file.fileUploaded.hasOwnProperty('path')) {
        errMsg = "Error: problem parsing uploaded file, file path not found. Check server logs or notify administrator.";
      }

      // Local file refs.
      file_size =  (file.fileUploaded.size) ? file.fileUploaded.size : null;
      filename = (file.fileUploaded.name) ? file.fileUploaded.name : null;
      file_type = (file.fileUploaded.type) ? file.fileUploaded.type : null;
      file_path = (file.fileUploaded.path) ? file.fileUploaded.path : null;

      console.log(file_path + '/' + filename);

      // Restrict file extensions
      if (file_type !== null) {
        // Checks if string exists in array
        if (swarm_approved_file_extensions.indexOf(file_type) > -1) {
          var swarm_ext_index = swarm_approved_file_extensions.indexOf(file_type);
          // Double checks our string match value matches the entry exactly
          if (file_type !== swarm_approved_file_extensions[swarm_ext_index]) {
            errMsg = "Error: problem parsing uploaded file, file extension invalid or not found";
          }
        } else {
          errMsg = "Error: problem parsing uploaded file, file extension invalid or not found";
        }
      } else {
        errMsg = "Error: problem parsing uploaded file, file extension invalid or not found";
      }

      // Server debug log
      console.log('New file upload received to ' + errType, [filename, file_size, file_type, file_path]);
    });

  if (!errMsg) {
    // Refs.
    var swarm_hash,
        http_response,
        http_error;
    // Post parameters
    var upload_options = {
      url: swarm_node,
      data: file_path + '/' + filename,
      headers: {
        'Content-Type': 'audio/mpeg'
      }
    };
    console.log('upload_options',upload_options);
    // Do HTTP POST to Swarm
    http_client.post(upload_options, function(err, res, body) {
      //console.log('body',body);
      //console.log('res', res);
      //console.log('err', err);
      http_error = err;
      // XXX (drew): I gotta fix this. This check is whack:
      if (http_error === null) {
        http_response = res;
        swarm_hash = body;
        // Send server response
        res = {
          http: {
            status: "200",
            msg: "Successfully uploaded file to Swarm hash: " + swarm_hash
          },
          data: {
            swarm: {
              storage_hash: swarm_hash,
              storage_link: 'bzz:/' + swarm_hash + '/'
            }
          }
        }
        // Clean up temporary files
        // XXX (drew): IDK BUT BELOW DOES NOT WORK LOL
        //fs.unlink(file_path + '/' + filename);
        // Send server response
        response.send(JSON.stringify(res));
      } else {
        // Clean up temporary files
        if (file_path && filename)
          //fs.unlink(file_path + '/' + filename);
        // Send server response
        errMsg = "Error: Swarm upload failed with reason " + JSON.stringify(http_error);
        errMsg = toErrorMsg(errMsg);
        console.log([errType, errMsg]);
        response.send(errMsg);
      }
    });
  } else {
    // Clean up temporary files
    //if (file_path && filename)
      //fs.unlink(file_path + '/' + filename);
    // Send server response
    errMsg = toErrorMsg(errMsg);
    console.log([errType, errMsg]);
    response.send(errMsg);
  }

});

/**
 * Retrieve a file to Swarm
 */
router.post('/swarm/download', function(request, response) {
  // Ensure valid JSON header
  response.header('Content-Type', 'application/json');

  const params = request.body;

  var res,
      errMsg,
      errType = "POST: /swarm/download";

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

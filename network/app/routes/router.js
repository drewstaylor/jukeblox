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
var formidable = require('express-formidable');
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
      file_type,
      swarm_hash;

  let fields = request.fields;  // contains non-file fields
  let files = request.files;    // contains files
  //console.log('fields',fields);
  //console.log('files',files);

  console.log('request', request);

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

  // Send server response
  response.send(JSON.stringify(res));
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

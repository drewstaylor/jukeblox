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
const swarm_approved_file_extensions = ['.aif', '.aiff', '.m4a', '.mp3', '.mpa', '.wav', '.wma', '.3gp', '.aa', '.aac', '.aax', '.flac', '.ogg', '.vox', '.webm', '.mov', '.asf', '.avi', '.mp4', '.mpg', '.srt', '.vob', '.wmv'];

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
 * Uploads a file to Swarm and creates relative attachment linkage to campaign. For now, the following file extensions are accepted:
 * 
 * <pre>
 *  const swarm_approved_file_extensions = ['.aif', '.aiff', '.m4a', '.mp3', '.mpa', '.wav', '.wma', '.3gp', '.aa', '.aac', '.aax', '.flac', '.ogg', '.vox', '.webm', '.mov', '.asf', '.avi', '.mp4', '.mpg', '.srt', '.vob', '.wmv'];
 * </pre>
 * 
 * <h5 style="margin-top:4px;margin-bottom:4px">Params:</h5>
 * 
 * <pre>
 * {String} id - The Organization ID for B2B marketplaces
 * {String} campaign - The Campaign ID affiliated with this Swarm file
 * {String} item - The Item ID affiliated with this Swarm file, if it's a bulk attachment use comma separated values and no whitespace like "2FYY2OAdaHvd7pFcVIef,bLUqGZH4VKIrL1EGxYrW", etc.
 * {Object} file - The target file to be uploaded to the Swarm node. Must be a "multipart/form-data" encoded object to be parsed correctly on the server. 
 * Example:
 *    &lt;form action="/upload" enctype="multipart/form-data" method="post"&gt
 *      &lt;input type="text" name="title"&gt
 *      &lt;input type="file" name="file"&gt
 *      &lt;input type="submit" value="Upload"&gt
 *    &lt;/form&gt
 * {String} mime - A valid mime type to be set on the target upload file, ex: 'audio/mpeg' for an mp3 audio file.
 * </pre>
 * 
 * <h5 style="margin-top:4px;margin-bottom:4px">Example Request:</h5>
 * 
 * <pre>
 * {
 *    "id": "2E8jngIUw5A1HHfvFexE",
 *    "campaign": "UXOILlS3dZgqYBhVqmVd",
 *    "item": "2FYY2OAdaHvd7pFcVIef",
 *    "file": [File Object],
 *    "mime": "audio/mpeg"
 * }
 * </pre>
 * 
 * <h5 style="margin-top:4px;margin-bottom:4px">Example Response:</h5>
 * 
 * <pre>
 * {  
 *   "http":{  
 *   "status":"200",
 *   "msg": "Successfully uploaded file <filename> to Swarm hash: 486e8cd97e4b47b0b45dbe2b3928fb765be022c49e36f9b46712d5c4a935b4dc
 * },
 * "data":{
 *    "swarm": {
 *      "storage_hash": "486e8cd97e4b47b0b45dbe2b3928fb765be022c49e36f9b46712d5c4a935b4dc",
 *      "storage_link": "bzz:/486e8cd97e4b47b0b45dbe2b3928fb765be022c49e36f9b46712d5c4a935b4dc/"
 *    }
 * }
 * </pre>
 * 
 * @section Swarm
 * @type POST
 * @url POST: /api/swarm/upload
 * @param {String} id - The Organization ID for the target marketplace.
 * @param {String} campaign - The Campaign ID for the target Swarm object.
 * @param {String} item - The Item ID for the target Swarm attachment.
 * @param {Object} file - Multipart encoded file object.
 * @param {String} mime - A valid mime type of the target upload file, ex: 'audio/mpeg'.
 */
// XXX TODO: Add more control parameters to mime type and file extension restrictions
router.post('/swarm/upload', function(request, response) {
  // Ensure valid JSON header
  response.header('Content-Type', 'application/json');

  const params = request.body;

  var res,
      errMsg,
      errType = "POST: /swarm/upload",
      filename,
      file_path,
      file_size,
      file_type;

  if (!params.file) {
    errMsg = "Error: upload target file invalid or missing.";
  } else if (!params.mime) {
    errMsg = "Error: Invalid or missing MIME type for target upload file."
  } else if (typeof params.mime !== "string") {
    errMsg = "Error: Invalid or missing MIME type for target upload file."
  } else {
    // XXX TODO: Parse file name and path
    var form = new formidable.IncomingForm();
    
    // Formidable settings
    form.keepExtensions = true;

    // Parse upload target
    form.parse(req, function(err, fields, file) {
      if (!files.hasOwnProperty('fileUploaded')) {
        errMsg = "Error: problem parsing uploaded file, 'fileUploaded' object invalid or not found";
        return;
      }
      if (!file.fileUploaded.hasOwnProperty('size')) {
        errMsg = "Error: problem parsing uploaded file, file size invalid or not found";
        return;
      }
      if (!file.fileUploaded.hasOwnProperty('name')) {
        errMsg = "Error: problem parsing uploaded file, filename invalid or not found";
        return;
      }
      if (!file.fileUploaded.hasOwnProperty('type')) {
        errMsg = "Error: problem parsing uploaded file, file extension invalid or not found";
        return;
      }
      if (!file.fileUploaded.hasOwnProperty('path')) {
        errMsg = "Error: problem parsing uploaded file, file path not found. Check server logs or notify administrator.";
        return;
      }

      // Local file refs.
      file_size =  (file.fileUploaded.size) ? file.fileUploaded.size : null;
      filename = (file.fileUploaded.name) ? file.fileUploaded.name : null;
      file_type = (file.fileUploaded.type) ? file.fileUploaded.type : null;
      file_path = (file.fileUploaded.path) ? file.fileUploaded.path : null;

      // Restrict file extensions
      if (file_type !== null) {
        // Checks if string exists in array
        if (swarm_approved_file_extensions.indexOf(file_type) > -1) {
          var swarm_ext_index = swarm_approved_file_extensions.indexOf(file_type);
          // Double checks our string match value matches the entry exactly
          if (file_type !== swarm_approved_file_extensions[swarm_ext_index]) {
            errMsg = "Error: problem parsing uploaded file, file extension invalid or not found";
            return;
          }
        } else {
          errMsg = "Error: problem parsing uploaded file, file extension invalid or not found";
          return;
        }
      } else {
        errMsg = "Error: problem parsing uploaded file, file extension invalid or not found";
        return;
      }

      // Server debug log
      console.log('New file upload received to ' + errType, [filename, file_size, file_type, file_path]);
    });
  }

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
        'Content-Type': params.mime
      }
    };
    // Do HTTP POST to Swarm
    http_client.post(upload_options, function(err, res, body) {
      //console.log(body);
      http_error = err;
      // Validity check
      if (http_error === null) {
        http_response = res;
        swarm_hash = body;

        // XXX TODO:
        // Handle Mongo storage and item / campaign / ERC1155 linkage

        // Send server response
        res = {
          http: {
            status: "200",
            msg: "Successfully uploaded file " + filename + " to Swarm hash: " + swarm_hash
          },
          data: {
            swarm: {
              storage_hash: swarm_hash,
              storage_link: 'bzz:/' + swarm_hash + '/'
            }
          }
        }
        // Clean up temporary files
        fs.unlink(file_path + '/' + filename);
        // Send server response
        response.send(JSON.stringify(res));
      } else {
        // Clean up temporary files
        if (file_path && filename)
          fs.unlink(file_path + '/' + filename);
        // Send server response
        errMsg = "Error: Swarm upload failed with reason " + JSON.stringify(http_error);
        errMsg = toErrorMsg(errMsg);
        console.log([errType, errMsg]);
        response.send(errMsg);
      }
    });
  } else {
    // Clean up temporary files
    if (file_path && filename)
      fs.unlink(file_path + '/' + filename);
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
    error: _errMsg[1]
  };
  if (additionalErr) {
    HTTP_Response.data = additionalErr;
  }

  return JSON.stringify(HTTP_Response);
};

module.exports = router;

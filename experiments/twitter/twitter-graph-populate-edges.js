"use strict";

/**
 * twitter-graph-populate-edges.js
 * This file generates bulk requests to the ES socket server, and import
 * edges data.
 *
 * @version 0.0.0.1
 * @author  ebarsallo
 *
 * @module experiments/twitter
 * @see lib/trueno
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 * Do NOT forget to reference the ORIGINAL author of the code.
 */

/* import modules */
const ProgressBar = require('progress');
const Promise = require("bluebird");
const Socket = require("uws");
const fs = require("fs");


/* websocket */
// var ws = new Socket('ws://localhost:8007');
var ws = new Socket('ws://127.0.0.1:8007');

var callbacks = {};

/* variables to keep track of batches and progress */
var limit = 10000000;
var counter = 0;

/* keeps the current batch to be sent */
var bulkOperations = [];

/* Elastic Search Index to be used */
const indexName = "twitter";
const typeName = "e";

/* source datasets/documents */
const input = [];

/* edges */
let edges;
/* lowerbound offset for ids */
let offset;

/* amount of records per request */
const batchSize  = 500;

/* set this variable to vertices if you want that kind of documents */
// let vQueue = Object.keys(vertices);

/* set this variable to edges if you want that kind of documents */
let vQueue;

let total, current = 0;

/* set this variables to simulate delete or insert */
var strRequest = "persist";
//var strRequest = "destroy";

/* showing request progress bar */
var previous = 0;
var bar = new ProgressBar("ElasticSearch Bulk Request [:bar] :percent :elapsed", {
  complete: '=',
  incomplete: ' ',
  width: 40,
  total: 100
});

/**
 * Insert/Delete Vertices/Edges per batches
 * @param operations -> [][]
 */
function bulkESRequest(operations) {

  return new Promise((resolve, reject) => {
    if(++counter <= limit){

      /* the payload object */
      var internal = {
        index: indexName,
        operations: operations
      };
      var payload = {
        callbackIndex: 'bulk1',
        action: "bulk",
        object: internal
      };

      /* sending the payload */
      ws.send(JSON.stringify(payload));
      /* adding callback */
      callbacks['bulk1'] = function(){
        total++;
        resolve();
      };
    }
  });

}//bulkESRequest

/**
 * Pushes the operation string and parameter into the bulk list.
 * @param {string} op - The operation to be inserted into the bulk list.
 * @param {object} obj - The operation object.
 */
function pushOperation(op, obj){
  bulkOperations.push({op: op, content: obj});
}

/**
 *  insert/delete vertices/edges in batch function
 *
 */
function insertDeleteVertices(arr, op, resolve, reject) {

  /* Persist all vertices */
  arr.forEach((vkey)=> {
    let v = {};
    v.id = null;
    v._label = null;
    v._prop = {};

    v.id = parseInt(vkey) + offset;

    v._label = "KNOWS";
    v.source = edges[vkey][0];
    v.target = edges[vkey][1];

    /* building the message */
    let payload = {
      graph: indexName,
      type: typeName,
      obj: v
    };

    if(op === "persist"){
      pushOperation("ex_persist", payload);
    }else{
      pushOperation("ex_destroy", payload);
    }

    current++;
  });

  /* send vertices' batches to the socket server */
  _bulk().then( (result) => {

    //console.log("Vertices batch created.", current / total);
    var currentTick = Math.floor(current/total*100);
    if(currentTick>previous){
      previous = currentTick;
      // console.log(thickness);
      // bar.tick();
    }

    /* Continue inserting */
    if (vQueue.length) {
      insertDeleteVertices(vQueue.splice(0, batchSize), op, resolve, reject);
    }else{
      console.timeEnd("time");
      resolve()
      // process.exit();
    }

  }, (error) => {

    console.log("Error: Vertices batch creation failed. %s \t %d%", error, (current * 100.0/ total) );
    /* Continue inserting */
    if (vQueue.length) {
      insertDeleteVertices(vQueue.splice(0, batchSize), op, resolve, reject);
    } else {
      reject(error)
      // process.exit();
    }

  });

}//insertVertex

/**
 * Builds bulk array request
 * @param b
 * @param reject
 * @returns {Array}
 */
function buildBulkOperations(b, reject) {

  /* the bulk operations array */
  let operations = [];
  var arrOperations = [];

  /* for each operation build the bulk corresponding operation */
  b.forEach((e)=> {
    /* content to be constructed according to the operation */
    let meta = {};
    switch (e.op) {
      case 'ex_persist':
        meta = {"index": {"_type": e.content.type}};
        /* setting id if present */
        if (!Number.isInteger(e.content.obj.id)) {
          console.log('->', e.content.obj);
          reject('All vertices and edges must have an integer id: [' + e.content.obj.id + ']');
          return;
        }
        /* setting id if present */
        meta.index._id = e.content.obj.id;

        /* adding meta */
        operations.push(meta);

        /* adding content */
        operations.push(e.content.obj);

        /* adding operations */
        arrOperations.push(["index",e.content.type,e.content.obj.id.toString(),
          JSON.stringify(e.content.obj)]);

        break;
      case 'ex_destroy':
        meta = {"delete": {"_type": e.content.type, _id: e.content.obj.id}};
        /* adding meta */
        operations.push(meta);

        /* I use this 2d array - adding operations */
        arrOperations.push(["delete",e.content.type,e.content.obj.id.toString()]);
        break;
    }
  });

  return arrOperations;

}//buildBulk

/**
 * Execute all operation in the batch on one call.
 * @return {Promise} - Promise with the bulk operations results.
 */
function _bulk() {

  let err="";
  let operations = buildBulkOperations(
    bulkOperations,
    (error) => {
      err = error;
      });

  /* report an error */
  if (err != "") {
    return new Promise((resolve, reject) => {
      reject(err);
    })
  }

  /* if no operations to submit return empty promise */
  if (bulkOperations.length === 0) {

    return new Promise((resolve, reject)=> {
      resolve({
        took: 0,
        errors: false,
        items: []
      });
    });

  }//if no operations

  /* return promise with the async operation */
  return new Promise((resolve, reject)=> {

    /* call Elastic Search Bulk Request */
    bulkESRequest(operations).then((results)=> {

      /* prepare array to take new batch of vertices/edges */
      bulkOperations = [];

      /* resolve the promise with the results */
      resolve(results);

    }, (err)=> {

      reject(err);

    });

  });

}//_bulk

/**
 * Uses vertices queue to create bulkOperations
 */
function buildVerticesFromJSON(resolve, reject){
  /* Initiating vertex insertion */
  insertDeleteVertices(vQueue.splice(0, batchSize), strRequest, resolve, reject);
}

/**
 * Process each input file, and insert the records onto the database
 * @param data
 */
function doProcess(data) {

  /* load vertices */
  edges = require (data.file);
  /* set offset */
  offset = parseInt(data.offset);
  console.log(data.file);
  /* get keys from input data */
  vQueue = Object.keys(edges);
  /* total keys to process on the iteration */
  total = vQueue.length;

  console.time("time");
  /* start bulk read and request to socket server */
  return new Promise((resolve, reject) => {
    buildVerticesFromJSON(resolve, reject);
  });

}

/**
 * Loop over all input files
 */
function doLoop() {

  let promise = doProcess(input.shift());

  promise.then((result) =>
  {
    if (input.length > 0) {
      doLoop();
    } else {
      console.log('done!');
      process.exit()
    }
  }, (error) => {
    console.log('Error while procesing bulk');
  });

}

ws.on('open', function open() {
  console.log('connected');

  /* accept args from command line */
  if ( process.argv.length > 2 ) {
    let filename = process.argv[2];
    let offset = process.argv[3];

    let obj = {};
    obj.file = filename;
    obj.offset = offset;

    input.length = 0;
    input.push(obj);
  }

  /* loop over all input entries */
  doLoop();

});

ws.on('error', function error() {
  console.log('Error connecting!');
});

ws.on('message', function(data, flags) {
  var obj = JSON.parse(data);
  //console.log(obj);
  /* invoke the callback */
  callbacks[obj.callbackIndex]();

  process.stdout.write('.');
});

ws.on('close', function(code, message) {
  console.log('Disconnection: ' + code + ', ' + message);
});

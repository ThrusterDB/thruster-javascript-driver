/**
 * graph-compute-neo4j.js
 * This file connects to neo4j and retrieve pakeranks
 *
 * @version 0.0.1
 * @author  Victor, Servio
 * @updated 2017.02.13
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 * Do NOT forget to reference the ORIGINAL author of the code. Be nice!
 */

console.time("totalTime");

let strMazerunnerUrl = "http://172.17.0.4:7474/service/mazerunner/analysis/pagerank/ITERACTION";

var http = require('http');

console.time("jobRequest");

//The url we want is: 'www.random.org/integers/?num=1&min=1&max=10&col=1&base=10&format=plain&rnd=new'
var options = {
  host: '172.17.0.4',
  port: '7474',
  path: '/service/mazerunner/analysis/pagerank/ITERACTION'
};

callback = function(response) {
  var str = '';

  //another chunk of data has been recieved, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been recieved, so we just print it out here
  response.on('end', function () {
    console.log(str);
    console.timeEnd("jobRequest");
  });
}

http.request(options, callback).end();

let r=require("request");
let txUrl = "http://172.17.0.4:7474/db/data/transaction/commit";

function cypher(query,params,cb) {
  r.post({uri:txUrl,
      json:{statements:[{statement:query,parameters:params}]}},
    function(err,res) { cb(err,res.body)})
}

//let query="MATCH (n) RETURN n";
//let query="MATCH (a)-[:INTERACTION]-()  RETURN DISTINCT id(a) as id, a.pagerank as pagerank  ORDER BY pagerank DESC";
let query="MATCH (a)-[:ITERACTION]-()  RETURN DISTINCT id(a) as id, a.pagerank as pagerank  ORDER BY pagerank DESC";
let params={limit: 10};
let cb=function(err,data) {
   //if(data.results[0].hasOwnProperty("data")){ 
   //console.log(data.results[0].data[0].row.pagerank);
   //if(!(data.results[0].data[0].row.pagerank == "undefined" || data.results[0].data[0].row.pagerank == "null")){ 
   if(!data.results[0].data[0].row.pagerank){
     console.timeEnd("totalTime");
     console.log(data.results[0].data[0].row);
     clearInterval(sparkJobTimer);
   } else {
     console.log("Spark Job Running"); 
    }
};//console.log(JSON.stringify(data)); };

var sparkJobTimer = setInterval(function() {
  cypher(query,params,cb);
}, 2000);



/**
 * biogrid-generate-csv-from-json.js
 * This file generates csvs according to source (json)
 *
 * @version 0.0.1
 * @author  Victor Santos, maverick-zhn(Servio Palacios)
 * @updated 2017.02.13
 *
 * This file is subject to the terms and conditions defined in
 * file 'LICENSE.txt', which is part of this source code package.
 * Do NOT forget to reference the ORIGINAL author of the code. Be nice!
 */

let fs = require("fs");
const biogrid = require('./biogrid3/biogrid3.json');

  let currentVertex = 1;
  let currentEdge = 1;
  let h = {};
  let verticesJSON = {};
  let arrVerticesNeo4jJSON = [];
  let edgesJSON = {};
  let arrEdgesJSON = [];

  let edgeSource = 0;
  let edgeDestination = 0;

   /* Iterate all vertices */
   biogrid.forEach((edge)=> {

     if (h.hasOwnProperty(edge.source)) {
       edgeSource = h[edge.source].id;
     }
     else{
       h[edge.source] = {};
       h[edge.source].id = currentVertex;
       verticesJSON[currentVertex.toString()] = {};
       verticesJSON[currentVertex.toString()].id = currentVertex.toString();//last edition
       verticesJSON[currentVertex.toString()].label = edge.iteractor1;
       verticesJSON[currentVertex.toString()].name = edge.source;
       arrVerticesNeo4jJSON.push(verticesJSON[currentVertex.toString()]);
       edgeSource = currentVertex;
       currentVertex++;
     }

     if (h.hasOwnProperty(edge.destination)) {
       edgeDestination = h[edge.destination].id;
     }
     else{
       h[edge.destination] = {};
       h[edge.destination].id = currentVertex;
       verticesJSON[currentVertex.toString()] = {};
       verticesJSON[currentVertex.toString()].id = currentVertex.toString();//last edition
       verticesJSON[currentVertex.toString()].label = edge.iteractor2;
       verticesJSON[currentVertex.toString()].name = edge.destination;
       arrVerticesNeo4jJSON.push(verticesJSON[currentVertex.toString()]);
       edgeDestination = currentVertex;
       currentVertex++;
     }

     edgesJSON[currentEdge] = {};
     edgesJSON[currentEdge].source = edgeSource;
     edgesJSON[currentEdge].destination = edgeDestination;
     edgesJSON[currentEdge].label = edge.detection;
     arrEdgesJSON.push(edgesJSON[currentEdge]);
     currentEdge++;

   });

console.log("Total vertices ", currentVertex);
console.log("Total edges ", currentEdge);

//var str2 = JSON.stringify(as);
let strVertices = JSON.stringify(verticesJSON);

fs.writeFile('biogrid-vertices.json', strVertices, function (err) {
  if (err) throw err;
  console.log('Vertices saved!');
});

let strArrVertices = JSON.stringify(arrVerticesNeo4jJSON);

fs.writeFile('biogrid-vertices-neo4j.json', strArrVertices, function (err) {
  if (err) throw err;
  console.log('Vertices saved!');
});

let strArrEdges = JSON.stringify(arrEdgesJSON);

fs.writeFile('biogrid-edges.json', strArrEdges, function (err) {
  if (err) throw err;
  console.log('Edges saved!');
});





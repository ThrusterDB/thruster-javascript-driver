/**
 * Created by: victor on 5/29/16.
 * Source: .js
 * Author: victor, servio
 * Description:
 *
 */

var fs = require('fs');
const biogrid = require('./BioGridDB.json');


  let currentVertex = 1;
  let currentEdge = 1;
  let h = {};
  let verticesJSON = {};
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
       verticesJSON[currentVertex.toString()].label = edge.source;
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
       verticesJSON[currentVertex.toString()].label = edge.destination;
       edgeDestination = currentVertex;
       currentVertex++;
     }

     edgesJSON[currentEdge] = {};
     edgesJSON[currentEdge].source = edgeSource;
     edgesJSON[currentEdge].destination = edgeDestination;
     edgesJSON[currentEdge].label = edge.interaction;
     arrEdgesJSON.push(edgesJSON[currentEdge]);
     currentEdge++;

   });

console.log("Total vertices ", currentVertex);
console.log("Total edges ", currentEdge);

var str = JSON.stringify(verticesJSON);

fs.writeFile('biogrid-vertices.json',str, function (err) {
  if (err) throw err;
  console.log('Vertices saved!');
});

// var strEdges = JSON.stringify(edgesJSON);
//
// fs.writeFile('biogrid-edges.json', strEdges, function (err) {
//   if (err) throw err;
//   console.log('Edges saved!');
// });

var strArrEdges = JSON.stringify(arrEdgesJSON);

fs.writeFile('biogrid-edges.json', strArrEdges, function (err) {
  if (err) throw err;
  console.log('Edges saved!');
});

//console.log(h);




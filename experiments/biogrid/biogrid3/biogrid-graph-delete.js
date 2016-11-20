/**
 * Created by: victor on 5/29/16.
 * Source: .js
 * Author: victor, servio
 * Description:
 *
 */

const Trueno = require('../../../lib/trueno');

/* Instantiate connection */

let trueno = new Trueno({host: 'http://localhost', port: 8000, debug: false});

trueno.connect((s)=> {



  /* Create a new Graph */
  let g = trueno.Graph();

  /* Set label: very important */
  g.setLabel('biogrid_function');

  /* persist g */
  g.destroy().then((result) => {
    console.log("Graph g destroyed", result);
  }, (error) => {
    console.log("Error: Graph g destruction failed", error);
  });

}, (s)=> {
  console.log('disconnected', s.id);
})
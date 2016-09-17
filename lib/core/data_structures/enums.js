"use strict";

/*
  ________                                                 _______   _______
 /        |                                               /       \ /       \
 $$$$$$$$/______   __    __   ______   _______    ______  $$$$$$$  |$$$$$$$  |
   $$ | /      \ /  |  /  | /      \ /       \  /      \ $$ |  $$ |$$ |__$$ |
   $$ |/$$$$$$  |$$ |  $$ |/$$$$$$  |$$$$$$$  |/$$$$$$  |$$ |  $$ |$$    $$<
   $$ |$$ |  $$/ $$ |  $$ |$$    $$ |$$ |  $$ |$$ |  $$ |$$ |  $$ |$$$$$$$  |
   $$ |$$ |      $$ \__$$ |$$$$$$$$/ $$ |  $$ |$$ \__$$ |$$ |__$$ |$$ |__$$ |
   $$ |$$ |      $$    $$/ $$       |$$ |  $$ |$$    $$/ $$    $$/ $$    $$/
   $$/ $$/        $$$$$$/   $$$$$$$/ $$/   $$/  $$$$$$/  $$$$$$$/  $$$$$$$/
 */

/**
 * Created by: Servio Palacios on 20160917
 * Source: enums.js
 * Author: Servio Palacios
 * Description: Enumeration for the next events:
 */

function Enums() {

  this.jobStatus = {
    STARTED: "STARTED",
    FINISHED: "FINISHED",
    RUNNING: "RUNNING",
    ERROR: "ERROR"
  };

  this.algorithmType = {
    DEPENDENCIES: "Dependencies",
    PAGE_RANK: "Page Rank",
    WORD_COUNT: "Word Count",
    TRIANGLE_COUNTING: "Triangle Counting",
    CONNECTED_COMPONENTS: "Connected Components",
    STRONGLY_CONNECTED_COMPONENTS: "Strongly Connected Components",
    SHORTEST_PATHS: "Shortest Paths",
    NONE: "None"
  };

  this.pageRank = {
    graph: "gnutella",
    TOL: 0.001,
    resetProb: 0.15
  };

}

/* Immutable for security reasons */
module.exports = Object.freeze(new Enums());
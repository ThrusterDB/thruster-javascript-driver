#!/bin/bash

# Trueno Labs
# Parse csv files (https://snap.stanford.edu/data/twitter-2010.html) and convert to
# json files.

# Processing
# First, csv files are split (on 200K lines files)
# split -l 200000 -a 4 -d twitter-2010.txt edges-
# split -l 200000 -a 4 -d twitter-2010-ids.csv vertices-


# vertices
# sep: {comma}
function vertices() {

   src1=/tmp/data/vertices-*

   for fn in $src1
   do
      filename1=${fn}".json"

      echo "Creating: " $filename1
      echo "{" > ${filename1}
      awk -F',' 'NR > 1 {printf ", "} {print "\""$1"\":{\"twitterId\": \"" $2 "\"}"}' $fn >> ${filename1}
      echo "}" >> ${filename1}

   done

   echo "done with vertices!"
}

# edges
# sep: {blank space}
function edges() {

   src2=/tmp/data/edges-*
   for fn2 in $src2
   do
      filename2=${fn2}".json"
      echo "Creating: " $filename2
      echo "[" >  ${filename2}
      awk -F' ' 'NR > 1 {printf ", "} {print "["$1","$2"]"}' $fn2 >> ${filename2}
      echo "]" >> ${filename2}
   done

   echo "done with edges!"
}

vertices
edges

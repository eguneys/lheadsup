#!/bin/bash

FILE=${1:-data/HandRanks.dat}

echo "Generating HandRanks.dat file."

if [ -f $FILE ]; then
  echo "$FILE exists."
else 
  if ! [ -f "dist/gen_tpt" ]; then
    gcc gen_tpt/generate_table.cpp gen_tpt/fast_eval.cpp -o dist/gen_tpt
  fi

  "dist/gen_tpt" "$FILE"

  if [ $? -eq 0 ]; then
    echo "$FILE written."
  fi
fi

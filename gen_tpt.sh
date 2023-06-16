#!/bin/bash

if [ -f "data/HandRanks.dat" ]; then
  echo "data/HandRanks.dat exists."
else 
  if ! [ -f "dist/gen_tpt" ]; then
    gcc gen_tpt/generate_table.cpp gen_tpt/fast_eval.cpp -o dist/gen_tpt
  fi

  ./dist/gen_tpt

  if [ $? -eq 0 ]; then
    echo "data/HandRanks.dat written."
  fi
fi

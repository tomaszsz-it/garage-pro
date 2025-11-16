#!/bin/bash

# This script resolves the EADDRINUSE error for Playwright reports

# Kill the process using the port 9323
PORT=9323
PID=$(lsof -ti tcp:$PORT)
if [ -n "$PID" ]; then
  echo "Killing process $PID using port $PORT"
  kill -9 $PID
else
  echo "No process is using port $PORT"
fi
 echo "Task completed, have a great day!"" 
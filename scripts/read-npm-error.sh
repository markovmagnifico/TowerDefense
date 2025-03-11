#!/bin/bash

# Find the most recent npm debug log
LATEST_LOG=$(ls -t ~/.npm/_logs/20*-debug-0.log 2>/dev/null | head -n 1)

if [ -z "$LATEST_LOG" ]; then
    echo "No npm error logs found"
    exit 0
fi

echo "Reading latest npm error log: $LATEST_LOG"
echo "----------------------------------------"
cat "$LATEST_LOG" 
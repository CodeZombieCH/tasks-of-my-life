#!/bin/sh
FIXTURES_DIR='test/fixtures'
TEMP_DIR='test/temp'
echo "Preparing test fixtures in $TEMP_DIR..."
if [ -d "$TEMP_DIR" ]; then
  rm -r "$TEMP_DIR"
fi
cp -r "$FIXTURES_DIR" "$TEMP_DIR"
echo "Preparing test fixtures in $TEMP_DIR completed"

#!/bin/bash

SOURCE_DIR="prisma/migrations"
DEST_DIR="../../apps/web/migrations"

rm -rf "${DEST_DIR:?}/"*

mkdir -p "$DEST_DIR"

for dir in "$SOURCE_DIR"/*; do
  if [ -d "$dir" ] && [ -f "$dir/migration.sql" ]; then
    folder_name=$(basename "$dir")
    cp "$dir/migration.sql" "$DEST_DIR/$folder_name.sql"
  fi
done

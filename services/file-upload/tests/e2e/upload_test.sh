#!/usr/bin/env bash

set -euo pipefail

if [ $# -ne 1 ]; then
  echo "Usage: $0 <file>" >&2
  exit 1
fi

file=$1

if [ ! -f "$file" ]; then
  echo "Error: File '$file' does not exist" >&2
  exit 1
fi

user="user123"
base_url="http://localhost:8080"

# Hit our endpoint to get a presigned upload url for minio
echo "=== Step 1: Getting presigned URL ==="
presigned_resp=$(
  xh POST "${base_url}/upload/presigned" \
    filename="$(basename "$file")" \
    content_type="image/jpeg" \
    user_id="$user" \
    fileSize:="$(stat -c%s "$file")"
)

# Extract url from response
upload_url=$(echo "$presigned_resp" | jq -r .upload_url)
echo "Generated presigned url: $upload_url"
# 'key' is the unique filename that minio creates for our uploaded file
key=$(echo "$presigned_resp" | jq -r .key)
echo "Generated file key: $key"
echo

echo "=== Step 2: Uploading file to MinIO ==="
upload_resp=$(
  xh PUT "$upload_url" \
    Content-Type:"text/plain" \
    @"$(basename "$file")"
)
echo "Upload response:"
echo "$upload_resp"
echo

echo "=== Step 3: Completing upload (saving metadata) ==="
complete_resp=$(
  xh POST "${base_url}/upload/complete" \
    key="$key" \
    user_id="$user"
)

printf "Complete response:\n %s" "$complete_resp"
echo

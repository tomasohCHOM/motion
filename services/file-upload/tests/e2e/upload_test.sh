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
presigned_resp=$(xh POST "${base_url}/upload/presigned" \
  filename="$file" \
  content_type="image/jpeg" \
  user_id="$user" \
  fileSize:=1048576)

# Extract url from response
upload_url=$(echo "$presigned_resp" | jq -r .upload_url)
echo "Generated presigned url: $upload_url"
# 'key' is the unique filename that minio creates for our uploaded file
key=$(echo "$presigned_resp" | jq -r .key)
echo "Generated file key: $key"
echo

upload_resp=$(xh PUT "$upload_url" <"$file")
echo "Upload response:"
echo "$upload_resp"
echo

# Upload metadata to postgres db
complete_resp=$(xh POST ${base_url}/upload/complete \
  key="$key" \
  user_id="$user")

printf "Complete response:\n %s" "$complete_resp"
echo

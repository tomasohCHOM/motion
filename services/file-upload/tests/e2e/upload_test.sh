#!/usr/bin/env bash

set -euo pipefail

file=$1
user="user123"

# Hit our endpoint to get a presigned upload url for minio
resp=$(xh POST :8080/upload/presigned filename="$file" content_type='image/jpeg' user_id="$user" fileSize:=1048576)

# Extract url from response
upload_url=$(echo "$resp" | jq -r .upload_url)
echo "Presigned url: $upload_url"
# 'key' is the unique filename that minio creates for our uploaded file
key=$(echo "$resp" | jq -r .key)
echo
echo "Key: $key"
echo

upload_resp=$(xh PUT "$upload_url" <"$file")
echo "Upload response:"
echo "$upload_resp"
echo

# Upload metadata to postgres db
echo xh POST :8080/upload/complete key="$key" user_id="$user"
complete_resp=$(xh POST :8080/upload/complete key="$key" user_id="$user")
echo "Complete response:"
echo "$complete_resp"
echo

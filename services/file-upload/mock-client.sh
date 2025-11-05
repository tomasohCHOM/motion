#!/usr/bin/env bash

file=$1

resp=$(xh POST :8080/upload/presigned filename="$file" content_type='image/jpeg' user_id='user123' fileSize:=1048576)

upload_url=$(echo "$resp" | jq -r .upload_url)
echo "Presigned url: $upload_url"
key=$(echo "$resp" | jq -r .key)
echo
echo "Key: $key"

xh PUT "$upload_url" <"$file"

xh POST :8080/upload/complete key="$key" user_id='user123'

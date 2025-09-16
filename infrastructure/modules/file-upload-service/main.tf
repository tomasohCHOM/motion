# resource "aws_s3_bucket" "file_uploads" {
#   bucket = "motion-file-uploads-${var.env}"
# }
#
# resource "aws_api_gateway_rest_api" "file_upload_api" {
#   name        = "file-upload-api-${var.env}"
#   description = "API for file uploads"
# }

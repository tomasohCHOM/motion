variable "vercel_api_token" {
  description = "Vercel API Access Token"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database Password"
  type        = string
  sensitive   = true
}

variable "aws_region" {
  description = "Primary AWS Reigion"
  type        = string
  default     = "us-west-1"
}

variable "aws_profile" {
  description = "AWS CLI User Profile to Use"
  type        = string
  default     = "default"
}

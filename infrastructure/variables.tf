variable "vercel_api_token" {
  description = "Vercel API Access Token"
  type        = string
  sensitive   = true
}

variable "aws_profile" {
  description = "AWS CLI User Profile to Use"
  type        = string
  default     = "default"
}

variable "pname" {
  description = "Project Name"
  type        = string
  default     = "motion"
}

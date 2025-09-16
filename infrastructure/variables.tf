variable "pname" {
  description = "Project Name"
  type        = string
  default     = "motion"
}

variable "aws_region" {
  description = "AWS Region to deploy to"
  type        = string
  default     = "us-west-1"
}

variable "vercel_api_token" {
  description = "Vercel API Token"
  type        = string
  sensitive   = true
}

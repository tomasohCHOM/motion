variable "db_password" {
  description = "The password for the database"
  type        = string
  sensitive   = true
}

variable "vercel_api_token" {
  description = "Vercel API Access Token"
  type        = string
  sensitive   = true
}

variable "pname" {
  description = "Project Name"
  type        = string
  default     = "motion"
}

variable "env" {
  description = "Project Name"
  type        = string
  default     = "prod"
}
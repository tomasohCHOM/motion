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

variable "vercel_api_token" {
  description = "Vercel API Access Token"
  type        = string
  sensitive   = true
}

variable "api_url" {
  description = "The URL of the API gateway"
  type        = string
}

variable "env" {
  description = "The environment name (e.g., 'dev' or 'prod')"
  type        = string
}

variable "billing_mode" {
  description = "The billing mode for the DynamoDB table"
  type        = string
}

variable "read_capacity" {
  description = "The read capacity for the DynamoDB table"
  type        = number
  default     = null
}

variable "write_capacity" {
  description = "The write capacity for the DynamoDB table"
  type        = number
  default     = null
}

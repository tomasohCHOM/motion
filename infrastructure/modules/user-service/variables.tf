variable "env" {
  description = "The environment name (e.g., 'dev' or 'prod')"
  type        = string
}

variable "allocated_storage" {
  description = "The allocated storage for the database"
  type        = number
}

variable "instance_class" {
  description = "The instance class for the database"
  type        = string
}

variable "db_password" {
  description = "The password for the database"
  type        = string
  sensitive   = true
}

variable "skip_final_snapshot" {
  description = "Whether to skip the final snapshot on deletion"
  type        = bool
}

variable "multi_az" {
  description = "Whether to create a multi-AZ database"
  type        = bool
}

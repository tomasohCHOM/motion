resource "aws_dynamodb_table" "messaging" {
  name           = "motion-messaging-${var.env}"
  billing_mode   = var.billing_mode
  read_capacity  = var.read_capacity
  write_capacity = var.write_capacity
  hash_key       = "project_id"

  attribute {
    name = "project_id"
    type = "S"
  }
}

resource "aws_ecs_cluster" "main" {
  name = "motion-${var.env}"
}

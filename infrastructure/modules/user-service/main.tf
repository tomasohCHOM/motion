resource "aws_db_instance" "main" {
  allocated_storage    = var.allocated_storage
  engine               = "postgres"
  instance_class       = var.instance_class
  db_name                 = "motion_${var.env}"
  username             = "admin"
  password             = var.db_password
  parameter_group_name = "default.postgres13"
  skip_final_snapshot  = var.skip_final_snapshot
  multi_az             = var.multi_az
}

resource "aws_db_subnet_group" "default" {
  name       = "${var.pname}-${var.env}-db-subnet-group"
  subnet_ids = var.private_subnet_ids
}

resource "aws_security_group" "db" {
  name        = "${var.pname}-${var.env}-db"
  description = "Allow postgres inbound traffic"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [var.default_security_group_id]
  }
}

resource "aws_db_instance" "main" {
  allocated_storage      = var.allocated_storage
  engine                 = "postgres"
  instance_class         = var.instance_class
  db_name                = "motion_${var.env}"
  username               = "admin"
  password               = var.db_password
  parameter_group_name   = "default.postgres13"
  skip_final_snapshot    = var.skip_final_snapshot
  multi_az               = var.multi_az
  db_subnet_group_name   = aws_db_subnet_group.default.name
  vpc_security_group_ids = [aws_security_group.db.id]
}
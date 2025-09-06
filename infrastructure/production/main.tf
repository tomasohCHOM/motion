# ECR repository for all services
resource "aws_ecr_repository" "main" {
  name = "motion-prod"
}

module "mailing_service" {
  source = "../modules/mailing-service"
  env    = "prod"
}

module "file_upload_service" {
  source = "../modules/file-upload-service"
  env    = "prod"
}

module "user_service" {
  source                = "../modules/user-service"
  env                   = "prod"
  allocated_storage     = 100
  instance_class        = "db.m5.large"
  db_password           = var.db_password
  skip_final_snapshot   = false
  multi_az              = true
}

module "messaging_service" {
  source         = "../modules/messaging-service"
  env            = "prod"
  billing_mode   = "PROVISIONED"
  read_capacity  = 5
  write_capacity = 5
}

# Production VPC
resource "aws_vpc" "main" {
  cidr_block = "10.0.0.0/16"

  tags = {
    Name = "motion-prod"
  }
}

# Production Subnets (HA)
resource "aws_subnet" "private_a" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.1.0/24"
  availability_zone = "us-east-1a"

  tags = {
    Name = "motion-prod-private-a"
  }
}

resource "aws_subnet" "private_b" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.2.0/24"
  availability_zone = "us-east-1b"

  tags = {
    Name = "motion-prod-private-b"
  }
}

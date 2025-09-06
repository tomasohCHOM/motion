# Production ECR repository
resource "aws_ecr_repository" "api_gateway" {
  name = "api-gateway-prod"
}

# Production ECS Cluster
resource "aws_ecs_cluster" "main" {
  name = "motion-prod"
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

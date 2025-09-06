module "vercel-frontend" {
  source = "../modules/vercel"

  vercel_api_token = var.vercel_api_token
}

# ECR repository for all services
resource "aws_ecr_repository" "main" {
  name = "motion-dev"
}

module "mailing_service" {
  source = "../modules/mailing-service"
  env    = "dev"
}

module "file_upload_service" {
  source = "../modules/file-upload-service"
  env    = "dev"
}

module "user_service" {
  source                = "../modules/user-service"
  env                   = "dev"
  allocated_storage     = 20
  instance_class        = "db.t3.micro"
  db_password           = var.db_password
  skip_final_snapshot   = true
  multi_az              = false
}

module "messaging_service" {
  source       = "../modules/messaging-service"
  env          = "dev"
  billing_mode = "PAY_PER_REQUEST"
}

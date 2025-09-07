module "networking" {
  source = "../modules/networking"
  pname  = var.pname
  env    = var.env
}

module "vercel-frontend" {
  source = "../modules/vercel-frontend"
  vercel_api_token = var.vercel_api_token
}

# ECR repository for all services
resource "aws_ecr_repository" "main" {
  name = "${var.pname}-${var.env}"
}

module "mailing_service" {
  source = "../modules/mailing-service"
  env    = var.env
}

module "file_upload_service" {
  source = "../modules/file-upload-service"
  env    = var.env
}

module "user_service" {
  source                = "../modules/user-service"
  env                   = var.env
  allocated_storage     = 20
  instance_class        = "db.t3.micro"
  db_password           = var.db_password
  skip_final_snapshot   = true
  multi_az              = false
  vpc_id                      = module.networking.vpc_id
  private_subnet_ids          = module.networking.private_subnet_ids
  default_security_group_id = module.networking.default_security_group_id
  pname                       = var.pname
}

module "messaging_service" {
  source       = "../modules/messaging-service"
  env          = var.env
  billing_mode = "PAY_PER_REQUEST"
}
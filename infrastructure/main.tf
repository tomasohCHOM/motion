locals {
  env_vars = {
    "default" = {
      user_service_allocated_storage   = 20
      user_service_instance_class      = "db.t3.micro"
      user_service_skip_final_snapshot = true
      user_service_multi_az            = false
      messaging_service_billing_mode   = "PAY_PER_REQUEST"
      messaging_service_read_capacity  = null
      messaging_service_write_capacity = null
      aws_region                       = "us-west-1"
    }
    "production" = {
      user_service_allocated_storage   = 100
      user_service_instance_class      = "db.m5.large" # example - probably shouldn't use this
      user_service_skip_final_snapshot = false
      user_service_multi_az            = true
      messaging_service_billing_mode   = "PROVISIONED"
      messaging_service_read_capacity  = 5
      messaging_service_write_capacity = 5
      aws_region                       = "us-east-1"
    }
  }

  env  = terraform.workspace == "default" ? "dev" : terraform.workspace
  vars = can(local.env_vars[terraform.workspace]) ? local.env_vars[terraform.workspace] : local.env_vars["default"]

  # Name of the secret in AWS Secrets Manager
  # db_secret_name     = "${var.pname}-${local.env}/user-service/db-password"
  # vercel_secret_name = "${var.pname}-${local.env}/vercel-api-token"
}

# data "aws_secretsmanager_secret_version" "db_password" {
#   secret_id = local.db_secret_name
# }

module "networking" {
  source     = "./modules/networking"
  pname      = var.pname
  env        = local.env
  aws_region = local.vars.aws_region
}

data "aws_secretsmanager_secret_version" "vercel_api_token" {
  secret_id = local.vercel_secret_name
}

module "vercel-frontend" {
  source           = "./modules/vercel-frontend"
  # vercel_api_token = data.aws_secretsmanager_secret_version.vercel_api_token.secret_string
  vercel_api_token = var.vercel_api_token
}

# ECR repository for all services
# resource "aws_ecr_repository" "main" {
#   name = "${var.pname}-${local.env}"
# }

# module "mailing_service" {
#   source = "./modules/mailing-service"
#   env    = local.env
# }

# module "file_upload_service" {
#   source = "./modules/file-upload-service"
#   env    = local.env
# }

# module "user_service" {
#   source                    = "./modules/user-service"
#   env                       = local.env
#   allocated_storage         = local.vars.user_service_allocated_storage
#   instance_class            = local.vars.user_service_instance_class
#   db_password               = data.aws_secretsmanager_secret_version.db_password.secret_string
#   skip_final_snapshot       = local.vars.user_service_skip_final_snapshot
#   multi_az                  = local.vars.user_service_multi_az
#   vpc_id                    = module.networking.vpc_id
#   private_subnet_ids        = module.networking.private_subnet_ids
#   default_security_group_id = module.networking.default_security_group_id
#   pname                     = var.pname
# }

# module "messaging_service" {
#   source         = "./modules/messaging-service"
#   env            = local.env
#   billing_mode   = local.vars.messaging_service_billing_mode
#   read_capacity  = local.vars.messaging_service_read_capacity
#   write_capacity = local.vars.messaging_service_write_capacity
# }

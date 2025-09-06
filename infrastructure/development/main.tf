module "vercel-frontend" {
  source = "../modules/vercel"

  vercel_api_token = var.vercel_api_token
}

# Development ECR repository
resource "aws_ecr_repository" "api_gateway" {
  name = "api-gateway-dev"
}

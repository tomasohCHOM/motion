module "vercel-frontend" {
  source = "./modules/vercel"

  vercel_api_token = var.vercel_api_token
}

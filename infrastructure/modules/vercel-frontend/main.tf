terraform {
  required_providers {
    vercel = {
      source  = "vercel/vercel"
      version = "~> 3.0"
    }
  }
}

provider "vercel" {
  api_token = var.vercel_api_token
}

resource "vercel_project" "motion-frontend" {
  name = "motion"
  git_repository = {
    type = "github"
    repo = "tomasohchom/motion"
  }

  root_directory   = "frontend"
  install_command  = "npm install"
  build_command    = "npm run build"
  output_directory = "dist"

  environment = { // example
    "API_URL" = var.api_url
  }
}

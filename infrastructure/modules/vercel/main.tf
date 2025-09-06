terraform {
  required_providers {
    vercel = {
      source = "vercel/vercel"
    }
  }
}

resource "vercel_project" "motion-frontend" {
  name      = "motion"
  git_repository = {
    type = "github"
    repo = "tomasohchom/motion"
  }

  root_directory = "frontend"
  install_command = "npm install"
  build_command = "npm run build"
  output_directory = "dist"

  environment = {
    "API_URL" = var.api_url
  }
}

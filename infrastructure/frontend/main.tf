resource "vercel_project" "motion-frontend" {
  name      = "motion"
  git_repository = {
    type = "github"
    repo = "tomasohchom/motion"
  }

  root_directory = "frontend"
  # install_command = "cd frontend && npm install"
  # build_command = "cd frontend && npm run build"
  # output_directory = "frontend/dist"
}

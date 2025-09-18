/* This bucket stores the state of our backend infra.
 * The default is to store this locally in a .tfstate file, but this enables the team
 * to access the same resources and not have duplicates of everything
 */
terraform {
  backend "s3" {
    bucket  = "motion-terraform-state-69"
    key     = "motion.tfstate"
    region  = "us-east-1"
    encrypt = true
  }
}

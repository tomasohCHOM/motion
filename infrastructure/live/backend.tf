terraform {
  backend "s3" {
    bucket         = "motion-terraform-state"
    key            = "motion.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "motion-terraform-locks"
  }
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 3.0"
    }
  }
}

provider "aws" {
  region  = local.vars.aws_region
  profile = "motion-project"

  default_tags {
    tags = {
      Project     = var.pname
      Environment = local.env
    }
  }
}




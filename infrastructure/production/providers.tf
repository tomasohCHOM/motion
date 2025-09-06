terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 0.3"
    }
  }
}

provider "aws" {
  region = "us-west-1"
}

provider "vercel" {
  api_token = var.vercel_api_token
}

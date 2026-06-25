provider "aws" {
  region = var.aws_secret_region
}

data "aws_secretsmanager_secret" "by_name" {
  name = var.aws_secret_name
}
terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 4.65.2"
    }
    null = {
      source  = "hashicorp/null"
      version = ">= 3.0.0"
    }
  }
}

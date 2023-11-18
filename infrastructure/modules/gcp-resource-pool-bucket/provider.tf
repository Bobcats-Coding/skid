terraform {
  required_version = ">= 1.0.0"
}

terraform {
  required_providers {
    google = {
      source = "hashicorp/google"
      version = ">= 4.65.1"
    }
  }
}

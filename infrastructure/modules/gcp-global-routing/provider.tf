terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google = {
      source = "hashicorp/google"
      version = ">= 4.65.2"
      configuration_aliases = [ google.domain-parent, google.domain, google.product ]
    }
  }
}

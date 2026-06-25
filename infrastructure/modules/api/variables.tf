variable "name" {
  type = string
  description = "Name"
}

variable "image" {
  type = string
  description = "Docker image"
}

variable "region" {
  type = string
  description = "GCP region"
}

variable "environment-variables" {
  type = map(string)
  default = {}
  description = "Environment"
}

variable "secrets" {
  type = set(string)
  default = []
  description = "Secrets"
}

variable "resource-pool-bucket" {
  type = string
  description = "Resource pool bucket name"
}

variable "is-sleeping" {
  type = bool
  description = "Is sleeping"
  default = true
}

variable "cloud-sql-connection-name" {
  type = string
  description = "Cloud SQL connection name (PROJECT:REGION:INSTANCE). When set, mounts the Cloud SQL Auth Proxy sidecar and allows connecting via unix socket."
  default = null
  nullable = true
}

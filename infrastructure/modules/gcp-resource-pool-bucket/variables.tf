variable "name" {
  type = string
  description = "Name"
}

variable "storage-class" {
  type = string
  description = "Storage class"
  default = "REGIONAL"
}

variable "region" {
  type = string
  description = "GCP region"
}

variable "project" {
  type = string
  description = "GCP project"
}

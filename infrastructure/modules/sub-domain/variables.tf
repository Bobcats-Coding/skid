variable "name" {
  type = string
  description = "Name"
}

variable "sub-domain" {
  type = string
  description = "Sub domain"
}

variable "description" {
  type = string
  description = "Description of sub domain"
}

variable "project" {
  type = string
  description = "GCP Project"
}

variable "parent-project" {
  type = string
  description = "Parent GCP Project"
}

variable "parent-managed-zone" {
  type = string
  description = "Managed zone"
}

variable "top-domain" {
  type = string
  description = "Domain"
}

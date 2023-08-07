variable "name" {
  type = string
  description = "Name"
}

variable "domain" {
  type = string
  description = "Domain"
}

variable "managed-zone" {
  type = string
  description = "Managed zone"
}

variable "project-domain" {
  type = string
  description = "GCP project holding the domain"
}

variable "project-product" {
  type = string
  description = "GCP project holding the product"
}

variable "is-wildcard" {
  type = bool
  default = true
  description = "is-wildcard"
}

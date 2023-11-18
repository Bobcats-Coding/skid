variable "name" {
  type = string
  description = "Name"
}

variable "domain" {
  type = string
  description = "Domain"
}

variable "parent-managed-zone" {
  type = string
  description = "Parent managed-zone"
}

variable "top-domain" {
  type = string
  description = "Top domain"
}

variable "sub-domain" {
  type = string
  description = "Sub domain"
}

variable "resource-pool" {
  type = string
  description = "Resource pool bucket name"
}

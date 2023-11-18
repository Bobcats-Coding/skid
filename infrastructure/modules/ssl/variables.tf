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

variable "is-wildcard" {
  type = bool
  default = true
  description = "is-wildcard"
}

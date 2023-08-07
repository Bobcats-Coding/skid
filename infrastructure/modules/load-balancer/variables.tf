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

variable "ssl-certificate" {
  type = string
  description = "SSL certificate"
}

variable "service" {
  type = string
  description = "Service"
}

variable "is-index-html-redirect" {
  type = bool
  default = false
  description = "If true: index.html redirects to /"
}

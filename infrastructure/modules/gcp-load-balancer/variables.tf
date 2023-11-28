variable "name" {
  type = string
  description = "Name"
}

variable "default-service" {
  type = string
  description = "Default service"
}

variable "ssl-certificate-map" {
  type = string
  description = "SSL certificate"
}

variable "services" {
  type = map(object({
    service = string
    domain = string
    managed-zone = string
    path = string
    is-index-html-redirect = optional(bool, false)
  }))
  description = "Services"
}

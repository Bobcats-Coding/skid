variable "name" {
  type = string
  description = "Name"
}

variable "certificates" {
  type = map(object({
    domain = string
    is-wildcard = bool
    managed-zone = string
  }))
  description = "Certificates"
}

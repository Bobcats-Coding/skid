variable "name" {
  type = string
  description = "Name"
}

variable "domains-to-certify" {
  description = "A list of top-level domains for which to create wildcard SSL certificates"
  type        = map(object({
    domain = string
    top-domain = string
    sub-domain = string
    managed-zone = string
  }))
}

variable "cloud-run-services" {
  description = "A list of Cloud Run services with their subdomains and paths"
  type = map(object({
    service = string
    domain      = string
    path        = string
    domain-key  = string
    is-html-redirect = optional(bool, false)
  }))
}

variable "location" {
  description = "Location"
  type = string
}

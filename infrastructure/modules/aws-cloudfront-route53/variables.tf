variable "domain_name" {
  type = string
  description = <<EOT
  The domain name part of the public URL to be set up as an alias.
  If the URL should be "https://www.example.com" this value is "example.com".
  The DNS zone for this domain must be hosted in the current AWS account. 
  EOT
}

variable "host_name" {
  type = string
  description = <<EOT
  The host name part of the public URL to be set up as an alias.
  If the URL should be "https://www.example.com" this value is "www".
  EOT
}

variable "cloudfront_domain_name" {
  type = string
  description = "The corresponding output of the '../aws-hosting-cloudfront' module."
}

variable "cloudfront_hosted_zone_id" {
  type = string
  description = "The corresponding output of the '../aws-hosting-cloudfront' module."
}


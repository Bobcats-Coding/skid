variable "bucket_name" {
  type = string
  description = "The name of the S3 bucket to be created that hosts the site."
}

variable "domain_name" {
  type = string
  description = <<EOT
  The DNS zone that is hosted in the same AWS account.
  For "https://www.example.com" this value should be "example.com".
  EOT
}

variable "host_name" {
  type = string
  description = <<EOT
  The host name part of the URL to access the distribution.
  For "https://www.example.com" this value should be "www".
  EOT
}


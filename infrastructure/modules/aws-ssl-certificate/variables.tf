# Must be us-east-1 for Cloudfront
# https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cnames-and-https-requirements.html#https-requirements-certificate-issuer
variable "aws_region" {
  type    = string
  default = "us-east-1"
  description = "The region where the certificate will be stored."
}

variable "domain_name" {
  type = string
  description = "The domain name part of the SSL certificate to create."
}

variable "host_name" {
  type = string
  description = "The host name part of the SSL certificate to create."
}


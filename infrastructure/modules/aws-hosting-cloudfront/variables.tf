variable "bucket_id" {
  type = string
  description = "The name of the S3 bucket to expose via Cloudfront"
}

variable "aliases" {
  type = list(string)
  description = <<EOT
  The list of FQDNs that the distribution shoud be accessed as.
  For example: ['www.example.com']
  EOT
}

variable "certificate_arn" {
  type = string
  description = <<EOT
  The ARN of the SSL certificate that has been created for the FQDN.
  For Cloudfront, the certificate must be stored in the us-east-1 region. 
  EOT
}

# https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PriceClass.html
variable "price_class" {
  type    = string
  default = "PriceClass_100"
  description = <<EOT
  The price category of the distribution.
  See: https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/PriceClass.html
  EOT
}

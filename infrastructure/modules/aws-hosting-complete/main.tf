module "bucket" {
  source      = "../aws-hosting-bucket"
  bucket_name = var.bucket_name
}

module "ssl_cert" {
  source      = "../aws-ssl-certificate"
  domain_name = var.domain_name
  host_name   = var.host_name
}

module "cloudfront" {
  source          = "../aws-hosting-cloudfront"
  bucket_id       = module.bucket.bucket_id
  certificate_arn = module.ssl_cert.certificate_arn
  aliases = [
    "${var.host_name}.${var.domain_name}",
  ]
}

module "route53" {
  source      = "../aws-cloudfront-route53"
  domain_name = var.domain_name
  host_name   = var.host_name
  cloudfront_domain_name    = module.cloudfront.cloudfront_domain_name
  cloudfront_hosted_zone_id = module.cloudfront.cloudfront_hosted_zone_id
}

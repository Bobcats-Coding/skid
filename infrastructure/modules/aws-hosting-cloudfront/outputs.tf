output "cloudfront_domain_name" {
  value = aws_cloudfront_distribution.static_site_distribution.domain_name
  description = "Exposed for creating the DNS alias in Route53"
}

output "cloudfront_hosted_zone_id" {
  value = aws_cloudfront_distribution.static_site_distribution.hosted_zone_id
  description = "Exposed for creating the DNS alias in Route53"
}

output "cloudfront_id" {
  value = aws_cloudfront_distribution.static_site_distribution.id
  description = "The ID of the Cloudfront distribution"
}
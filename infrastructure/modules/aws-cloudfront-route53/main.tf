data "aws_route53_zone" "dns_zone" {
  name         = var.domain_name
  private_zone = false
}

resource "aws_route53_record" "cloudfront" {
  zone_id = data.aws_route53_zone.dns_zone.zone_id
  name    = "${var.host_name}.${var.domain_name}"
  type    = "A"

  alias {
    name                   = var.cloudfront_domain_name
    zone_id                = var.cloudfront_hosted_zone_id
    evaluate_target_health = false
  }
}

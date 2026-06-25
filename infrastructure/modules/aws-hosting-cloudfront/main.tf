data "aws_s3_bucket" "hosting" {
  bucket = var.bucket_id
}

data "aws_iam_policy_document" "hosting_allow_cloudfront" {
  statement {
    principals {
      type        = "Service"
      identifiers = ["cloudfront.amazonaws.com"]
    }

    actions = [
      "s3:GetObject",
    ]

    resources = [
      "${data.aws_s3_bucket.hosting.arn}/*",
    ]

    condition {
      test     = "StringEquals"
      variable = "AWS:SourceArn"
      values   = [aws_cloudfront_distribution.static_site_distribution.arn]
    }
  }
}

resource "aws_s3_bucket_policy" "static_site_storage_allow_dist" {
  bucket = data.aws_s3_bucket.hosting.id
  policy = data.aws_iam_policy_document.hosting_allow_cloudfront.json
}

locals {
  prefix       = data.aws_s3_bucket.hosting.id
  s3_origin_id = "${local.prefix}-cloudfront-origin"
}

resource "aws_cloudfront_origin_access_control" "static_site_dist" {
  name                              = "${local.prefix}-cloudfront-origin-acl"
  origin_access_control_origin_type = "s3"
  signing_behavior                  = "always"
  signing_protocol                  = "sigv4"
}

resource "aws_cloudfront_distribution" "static_site_distribution" {
  origin {
    domain_name              = data.aws_s3_bucket.hosting.bucket_regional_domain_name
    origin_id                = local.s3_origin_id
    origin_access_control_id = aws_cloudfront_origin_access_control.static_site_dist.id
  }

  enabled             = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods        = ["GET", "HEAD"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = local.s3_origin_id
    viewer_protocol_policy = "redirect-to-https"
    # https://us-east-1.console.aws.amazon.com/cloudfront/v4/home?region=us-east-1#/policies/cache/658327ea-f89d-4fab-a63d-7e88639e58f6
    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
      locations        = []
    }
  }

  viewer_certificate {
    acm_certificate_arn = var.certificate_arn
    ssl_support_method  = "sni-only"
  }

  price_class = var.price_class
  aliases     = var.aliases
}


output "content_s3" {
  value = var.bucket_name
  description = "The name of the S3 bucket created. Upload content here."
}

output "dist_url" {
  value = "https://${var.host_name}.${var.domain_name}"
  description = "The URL to open the site in the browser."
}

output "cloudfront_id" {
  value = module.cloudfront.cloudfront_id
  description = "The ID of the Cloudfront distribution"
}
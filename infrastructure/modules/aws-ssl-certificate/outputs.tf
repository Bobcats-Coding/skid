output "certificate_arn" {
  value = aws_acm_certificate.ssl_cert.arn
  description = "The ARN of the SSL certificate that has been created."
}

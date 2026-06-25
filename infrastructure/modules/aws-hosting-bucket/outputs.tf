output "bucket_id" {
  value = aws_s3_bucket.bucket.id
  description = "The name of the S3 bucket that was created."
}

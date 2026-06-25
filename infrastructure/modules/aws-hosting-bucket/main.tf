resource "aws_s3_bucket" "bucket" {
  bucket        = var.bucket_name
  force_destroy = true
}

resource "aws_s3_bucket_ownership_controls" "hosting" {
  bucket = aws_s3_bucket.bucket.id
  rule {
    object_ownership = "BucketOwnerPreferred"
  }
}

resource "aws_s3_bucket_acl" "hosting" {
  depends_on = [
    aws_s3_bucket_ownership_controls.hosting,
  ]

  bucket = aws_s3_bucket.bucket.id
  acl    = "private"
}
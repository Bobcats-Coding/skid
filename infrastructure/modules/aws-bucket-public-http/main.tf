resource "aws_s3_bucket_website_configuration" "hosting" {
  bucket = var.bucket_id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_public_access_block" "hosting" {
  bucket = var.bucket_id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}


data "aws_s3_bucket" "hosting" {
  bucket = var.bucket_id
}
data "aws_iam_policy_document" "hosting" {
  statement {
    sid    = "AllowPublicRead"
    effect = "Allow"
    resources = [
      "${data.aws_s3_bucket.hosting.arn}/*",
    ]
    actions = ["S3:GetObject"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
  }
}
resource "aws_s3_bucket_policy" "bucket-policy" {
  bucket = var.bucket_id
  policy = data.aws_iam_policy_document.hosting.json
}

variable "aws_secret_region" {
  type = string
  description = "The region where the secret is stored in AWS Secret Manager."
}
variable "aws_secret_name" {
  type = string
  description = "The name by which the secret is stored in AWS Secret Manager."
}
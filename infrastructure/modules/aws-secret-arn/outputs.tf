output "arn" {
  value = data.aws_secretsmanager_secret.by_name.arn
  description = "The ARN of the secret that has been looked up."
}
output "function_url" {
  value = aws_lambda_function_url.lambda.function_url
  description = "The HTTP URL where the lambda can be invoked."
}

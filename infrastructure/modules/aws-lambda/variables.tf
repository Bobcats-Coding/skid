variable "name" {
  type = string
  description = "The name of the lambda function to be created."
}
variable "source_dir" {
  type = string
  description = "The directory that contains the source code of the lambda."
}
variable "secret_arns" {
  type = list(string)
  description = <<EOT
  The list of ARNs that specify the secrets in AWS Secret Manager
  that this created lambda will be able to read.
  EOT
}
variable "lambda_handler" {
  type = string
  default = "index.handler"
  description = "The reference to the entry point of the lambda function."
}
variable "runtime" {
  type = string
  default = "nodejs18.x"
  description = "The runtime to execute the lambda function."
}
variable "lambda_env_vars" {
  type = map(string)
  description = <<EOT
  The environment variables that should be available to the lambda function
  during runtime. AWS does not recommend putting sensitive data here.
  EOT
}
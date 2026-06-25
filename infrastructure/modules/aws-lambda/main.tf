data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = var.source_dir
  # TODO: This will probably not work if the module is used more than once in the 
  # same build. The ZIP file should have a unique path. 
  output_path = "${path.module}/build/lambda.zip"
}

data "aws_iam_policy_document" "lambda" {
  statement {
    effect = "Allow"

    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }

    actions = ["sts:AssumeRole"]
  }
}

data "aws_iam_policy_document" "lambda_secret" {
  statement {
    effect = "Allow"

    actions = [
      "secretsmanager:GetSecretValue"
    ]
    resources = var.secret_arns
  }
}

locals {
  has_secrets = length(var.secret_arns) > 0
}

resource "aws_iam_role" "lambda" {
  name               = "${var.name}_iam_role"
  assume_role_policy = data.aws_iam_policy_document.lambda.json

  inline_policy {
    name   = local.has_secrets ? "read_secret" : null
    policy = local.has_secrets ? data.aws_iam_policy_document.lambda_secret.json : null
  }
}

data "aws_iam_policy" "lambda_basic_execution" {
  arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_iam_role_policy_attachment" "lambda_basic_execution" {
  role       = aws_iam_role.lambda.name
  policy_arn = data.aws_iam_policy.lambda_basic_execution.arn
}

resource "aws_lambda_function" "lambda" {
  filename      = data.archive_file.lambda.output_path
  function_name = var.name
  role          = aws_iam_role.lambda.arn
  handler       = var.lambda_handler

  source_code_hash = data.archive_file.lambda.output_base64sha256

  runtime = var.runtime

  environment {
    variables = var.lambda_env_vars
  }
}

resource "aws_lambda_function_url" "lambda" {
  function_name      = aws_lambda_function.lambda.function_name
  authorization_type = "NONE"
}

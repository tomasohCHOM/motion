resource "aws_sqs_queue" "mailing_service_queue" {
  name = "mailing-service-queue-${var.env}"
}

resource "aws_iam_role" "mailing_service_lambda_role" {
  name = "mailing-service-lambda-role-${var.env}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_lambda_function" "mailing_service_lambda" {
  function_name = "mailing-service-lambda-${var.env}"
  role          = aws_iam_role.mailing_service_lambda_role.arn
  handler       = "main"
  runtime       = "provided.al2023" # Go not supported directly, need to use a container
  filename      = "dummy.zip"       # Placeholder
}

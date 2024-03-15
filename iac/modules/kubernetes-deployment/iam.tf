resource "aws_iam_user" "app_admin_user" {
  name = "${var.app_name}-user-${var.environment}"
}

resource "aws_iam_access_key" "user_access_keys" {
  user = aws_iam_user.app_admin_user.name
}

resource "aws_iam_policy" "app_admin_user_policy" {
  name = "${var.app_name}-user-policy-${var.environment}"
  path        = "/"
  description = "${var.app_name} Admin User policy in ${var.environment}"

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = [
          "s3:*",
          "ecr:*",
          "cloudfront:*",
          "sns:*"
        ]
        Effect   = "Allow"
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_user_policy_attachment" "iam_policy" {
  policy_arn = aws_iam_policy.app_admin_user_policy.arn
  user       = aws_iam_user.s3_access_user.name
}

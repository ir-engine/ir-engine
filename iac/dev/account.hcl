locals {
  account_name   = "dev"
  aws_profile    = "dev"
  aws_account_id = get_env("AWS_ACCOUNT_ID", "186789868624")
  aws_role_arn   = get_env("AWS_ROLE_ARN", "arn:aws:iam::186789868624:role/ir-dev-platform-admins")
}

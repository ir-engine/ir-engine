locals {
  account_name   = "dev"
  aws_profile    = "dev"
  aws_account_id = get_env("AWS_ACCOUNT_ID")
  aws_role_arn   = get_env("AWS_ROLE_ARN")
}

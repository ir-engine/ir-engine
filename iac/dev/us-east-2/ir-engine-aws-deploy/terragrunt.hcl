# Source terraform IaC
include "root" {
  path = find_in_parent_folders()
}

generate "provider" {
  path = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents = <<EOF
provider "aws" {
  region = "${local.region}"
  allowed_account_ids = ["${local.account_id}"]
  assume_role {
    role_arn = "${local.account_role_arn}"
  }
}
EOF
}

terraform {
  source = local.base_source_url
}

locals {
  account_env_vars = read_terragrunt_config(find_in_parent_folders("account.hcl"))
  region_vars      = read_terragrunt_config(find_in_parent_folders("region.hcl"))
  region           = local.region_vars.locals.aws_region
  vpc_id           = local.region_vars.locals.vpc_id
  env              = local.account_env_vars.locals.aws_profile
  account_id       = local.account_env_vars.locals.aws_account_id
  account_role_arn = local.account_env_vars.locals.aws_role_arn

  base_source_url  = "${get_repo_root()}/iac/modules/ir-engine-aws-deploy"
}


inputs = {
  app_name = "ir-engine"
  environment = local.env
  vpc_id = local.vpc_id
  public_subnets = [
    "subnet-023a00c6fd4f74a6e",
    "subnet-0e6641990be344efe",
    "subnet-02b3b7f173d82f83c"
  ]
  private_subnets = [
    "subnet-0fe7332137462dd6b",
    "subnet-062cbed1a8853fa0a",
    "subnet-011e9807be1718b7b"
  ]
  rds_subnet_group = "db-subnet-group-${local.env}"
  acm_cert_arn = get_env("ACM_CERT_ARN")
  vpc_cidr = "10.72.0.0/16"
  rds_whitelist_ips = [
    "98.7.124.2/32",        // Lucas home
    "67.245.68.240/32",     // Irene home
    "73.189.150.160/32",    // Ching home
    "136.52.40.30/32",      // Kyle home
  ]
  rds_instance_class = "db.t3.small"
  ecr_read_write_access_arn = local.account_role_arn
  default_tags = {
    terraform   = "true"
    iac         = "ir-engine"
    environment = local.env
    client      = "IR"
  }
}

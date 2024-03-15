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

  base_source_url  = "${get_repo_root()}/iac/modules/api"
}


inputs = {
  app_name = "ir-platform-api"
  environment = local.env
  vpc_id = local.vpc_id
  # public subnets
  eks_configs = {
    ir-engine-main-1 = {
      cluster_add_ons = {
        coredns = {most_recent = true}
        kube-proxy = {most_recent = true}
        vpc-cni = {most_recent = true}
        aws-ebs-csi-driver = {most_recent = true}
        eks-pod-identity-agent = {most_recent = true}
      }
      managed_node_config = {
        min_size = 2
        max_size = 5
        desired_size = 2
        capacity_type = "SPOT"
        instance_type = ["t3a.medium"]
      }
      endpoint_public = true
      private_subnet = false
    }
    ng-instanceservers-1 = {

    }
    ng-redis-1 = {}
    ng-builder-1 = {}
  }
  public_subnets = [
    "subnet-023a00c6fd4f74a6e",
    "subnet-0e6641990be344efe",
    "subnet-02b3b7f173d82f83c"
  ]
  # private subnets
  private_subnets = [
    "subnet-0fe7332137462dd6b",
    "subnet-062cbed1a8853fa0a",
    "subnet-011e9807be1718b7b"
  ]

  default_tags = {
    terraform   = "true"
    iac         = "ir-platform"
    environment = local.env
    client      = "IR"
  }
}

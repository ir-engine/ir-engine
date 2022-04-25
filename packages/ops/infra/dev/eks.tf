module "eks" {
  source          = "terraform-aws-modules/eks/aws"
  version         = "17.24.0"
  cluster_name    = var.cluster_name
  cluster_version = "1.20"
  subnets         = ["subnet-0b0d6a4d12cc06478","subnet-06ef1cebf80d8e6f1","subnet-012499dce65afd1e2"]

  vpc_id = var.vpc_id

  map_users = length(var.map_users) > 0 ? var.map_users : []
  map_roles = var.map_roles
  enable_irsa = true
  write_kubeconfig = false
  manage_aws_auth = false

  workers_group_defaults = {
    root_volume_type = "gp2"
  }

  worker_groups = [
    {
      name                          = "worker-group-1"
      instance_type                 = "t3.xlarge"
      additional_userdata           = "echo foo bar"
      additional_security_group_ids = "sg-0a9c668c2d9230485"
      asg_desired_capacity          = 2
    },
    {
      name                          = "worker-group-2"
      instance_type                 = "t2.medium"
      additional_userdata           = "echo foo bar"
      additional_security_group_ids = "sg-0a9c668c2d9230485"
      asg_desired_capacity          = 1
    },
  ]
}

data "aws_eks_cluster" "cluster" {
  name = module.eks.cluster_id
}

data "aws_eks_cluster_auth" "cluster" {
  name = module.eks.cluster_id
}
module "eks_cluster" {
  source = "terraform-aws-modules/eks/aws"
  cluster_name = "${var.cluster_name}-${var.environment}"
  cluster_version = var.kubernetes_version
  subnets = var.subnets
  vpc_id  = var.vpc_id
  map_users = length(var.map_users) > 0 ? var.map_users : []
  map_roles = var.map_roles
  enable_irsa = true
  write_kubeconfig = false
  tags   = local.common_tags

  node_group_default = {
    disk_size = 40
  }

  node_groups = {
    "${var.environment}-ng-gpu-01" = {
      desired_capacity = 1
      min_capacity = 1
      max_capacity = 5
      ami_type = ""
      version = var.kubernetes_version
      instance_types = var.gpu_instance_types
      capacity_type = "ON_DEMAND"
      public_ip = true

      k8s_labels = {
        project_name = var.project_name
        environment = var.environment
        region  = var.aws_region
      }
    }
    "${var.environment}-ng-nogpu-01" = {
      desired_capacity =1
      min_capacity = 1
      max_capacity = 5
      ami_type = ""
      version = var.kubernetes_version
      instance_types = var.no_gpu_instance_types
      capacity_type = "ON_DEMAND
      public_ip = true

      k8s_labels = {
        project_name = var.project_name
        environment = var.environment
        region = var.aws_region
      }
    }
  }
}
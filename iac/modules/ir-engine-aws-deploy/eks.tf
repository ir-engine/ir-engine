module "eks_engine_main" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "${var.app_name}-${var.environment}"
  cluster_version = "1.29"
  cluster_endpoint_public_access  = true
  cluster_addons = {
    coredns = {most_recent = true}
    kube-proxy = {most_recent = true}
    vpc-cni = {most_recent = true}
    aws-ebs-csi-driver = {most_recent = true}
    eks-pod-identity-agent = {most_recent = true}
  }
  eks_managed_node_group_defaults = {
    instance_types = ["t2.small"]
  }
  eks_managed_node_groups = {
    ir-engine-main-1 = {
      desired_size = 3
      min_size = 3
      max_size = 16
      capacity_type = "SPOT"
      instance_type = ["t3a.medium"]
    }
    ng-instanceservers-1 = {
      desired_size = 8
      min_size = 8
      max_size = 24
      capacity_type = "ON_DEMAND"
      instance_type = ["t3a.small"]
    }
    ng-redis-1 = {
      desired_size = 2
      min_size = 2
      max_size = 2
      capacity_type = "ON_DEMAND"
      instance_type = ["t3a.small"]
    }
    ng-builder-1 = {
      desired_size = 1
      min_size = 1
      max_size = 1
      capacity_type = "SPOT"
      instance_type = ["t3a.2xlarge"]
    }
  }
  enable_cluster_creator_admin_permissions = true

  vpc_id                   = var.vpc_id
  subnet_ids               = var.public_subnets

  create_cluster_security_group = true
  cluster_security_group_additional_rules = {
    ingress_udp = {
      type = "ingress"
      from_port = 7000
      to_port = 8000
      protocol = "udp"
      cidr_blocks = ["0.0.0.0/0"]
    },
    ingress_tcp = {
      type = "ingress"
      from_port = 7000
      to_port = 8000
      protocol = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  }

  # To add the current caller identity as an administrator, set true

  /*
  access_entries = {
    # One access entry with a policy associated
    example = {
      kubernetes_groups = []
      principal_arn     = "arn:aws:iam::123456789012:role/something"

      policy_associations = {
        example = {
          policy_arn = "arn:aws:eks::aws:cluster-access-policy/AmazonEKSViewPolicy"
          access_scope = {
            namespaces = ["default"]
            type       = "namespace"
          }
        }
      }
    }
  }
  */

  tags = var.default_tags
}

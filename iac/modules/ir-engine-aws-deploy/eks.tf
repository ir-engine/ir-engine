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
    iam_role_additional_policies = { AmazonEBSCSIDriverPolicy = "arn:aws:iam::aws:policy/service-role/AmazonEBSCSIDriverPolicy" }
  }
  eks_managed_node_groups = {
    ir-engine-main-1 = {
      desired_size = 3
      min_size = 3
      max_size = 16
      capacity_type = "SPOT"
      instance_types = ["t3a.medium"]
      block_device_mappings = {
        device = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size = 20
          }
        }
      }
    }
    ng-instanceservers-1 = {
      desired_size = 8
      min_size = 8
      max_size = 24
      capacity_type = "ON_DEMAND"
      instance_types = ["t3a.small"]
      block_device_mappings = {
        device = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size = 20
          }
        }
      }
    }
    ng-redis-1 = {
      desired_size = 2
      min_size = 2
      max_size = 2
      capacity_type = "ON_DEMAND"
      instance_types = ["t3a.small"]
      block_device_mappings = {
        device = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size = 20
          }
        }
      }
    }
    ng-builder-1 = {
      desired_size = 1
      min_size = 1
      max_size = 1
      capacity_type = "SPOT"
      instance_types = ["t3a.2xlarge"]
      block_device_mappings = {
        device = {
          device_name = "/dev/xvda"
          ebs = {
            volume_size = 50
          }
        }
      }
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
    self = {
      type = "ingress"
      protocol = "-1"
      from_port = 0
      to_port = 65535
      self = true
    }
    temp = {
      type = "ingress"
      protocol = "-1"
      from_port = 0
      to_port = 65535
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
  node_security_group_additional_rules = {
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
    self = {
      type = "ingress"
      protocol = "-1"
      from_port = 0
      to_port = 65535
      self = true
    }
    temp = {
      type = "ingress"
      protocol = "-1"
      from_port = 0
      to_port = 65535
      cidr_blocks = ["0.0.0.0/0"]
    }
  }
  node_security_group_enable_recommended_rules = true

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

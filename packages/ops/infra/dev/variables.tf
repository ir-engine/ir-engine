variable "project_name" {
  type = string
  description = "project name"
  default = "nexus"
}
variable "cluster_name" {
  type = string
  description = "cluster name"
  default = "xrengine"
}

variable "environment" {
  type = string
  description = "Environment name"
  default = "dev"
}

variable "aws_region" {
  type = string
  description = "AWS Region"
  default = "us-east-1"
}

variable "kubernetes_version" {
  type = string
  description = "k8s version"
  default = "1.20"
}

variable "vpc_id"{
  type = string
  description = "vpc id"
  default = "vpc-09923f7ecc88171ee"
}

variable "subnets" {
  type = list(string)
  description = "list of subnets"
  default = ["subnet-0b0d6a4d12cc06478","subnet-06ef1cebf80d8e6f1","subnet-012499dce65afd1e2"]

}

variable "no_gpu_instance_types" {
  type = list(string)
  description = "Instance type for EKS cluster"
  default = ["t3.xlarge"]
}

variable "gpu_instance_types" {
  type = list(string)
  description = "Instance type for gpu"
  default = ["g4dn.xlarge"]
}

variable "map_users" {
  type = list(object({
      userarn = string
      username = string
      groups = list(string)
  }))
  default = []
}

variable "map_roles" {
  type = list(object({
    rolearn = string
    username = string
    groups = list(string)

  }))

  default =[
    {
      rolearn = "arn:aws:iam::007136193514:role/AWSServiceRoleForAmazonEKSNodegroup"
      username = "admin"
      groups = ["system:masters"]
    }
  ]
}
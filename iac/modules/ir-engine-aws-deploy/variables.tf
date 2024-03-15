variable "app_name" {
  type        = string
  description = "REQUIRED: Name of application"
}

variable "environment" {
  type        = string
  description = "REQUIRED: dev,stg,prd, etc."
}

variable "vpc_id" {
  type        = string
  description = "REQUIRED: VPC ID"
}

variable "private_subnets" {
  type    = list
  description = "REQUIRED: List of private VPC subnets"
}

variable "public_subnets" {
  type    = list
  description = "REQUIRED: List of public VPC subnets"
}

variable "rds_subnet_group" {
  type        = string
  description = "REQUIRED: RDS Subnet Group Name"
}

variable "vpc_cidr" {
  type        = string
  description = "VPC CIDR that corresponds to `var.vpc_id`"
  default     = "10.72.0.0/16"
}

variable "rds_instance_class" {
  type        = string
  description = "RDS Compute Instance Class"
  default     = "db.t3.small"
}

variable "ecr_read_write_access_arn" {
  type        = string
  description = "ARN of user to have read/write access to ECRs"
  default     = ""
}

variable "default_tags" {
  type        = map(string)
  description = "Default tags for resource"
  default     = {}
}

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

variable "default_tags" {
  type        = map(string)
  description = "Default tags for resource"
  default     = {}
}

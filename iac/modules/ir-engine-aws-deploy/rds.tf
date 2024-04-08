resource "random_password" "rds_pass" {
  length           = 16
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

module "rds" {
  source  = "terraform-aws-modules/rds/aws"
  version = "~> 6.5"

  identifier           = "${var.app_name}-rds-${var.environment}"
  engine               = "mariadb"
  major_engine_version = "10"
  engine_version       = "10.6"
  instance_class       = var.rds_instance_class

  db_name             = replace(var.app_name, "/[^a-zA-Z0-9]/", "")
  username            = replace(var.app_name, "/[^a-zA-Z0-9]/", "")
  password            = random_password.rds_pass.result
  port                = 5432
  publicly_accessible = true

  create_db_subnet_group = false
  db_subnet_group_name   = var.rds_subnet_group
  vpc_security_group_ids = [module.rds_sg.security_group_id]

  storage_type          = "gp3"
  allocated_storage     = 30
  max_allocated_storage = 100

  create_db_option_group    = false
  create_db_parameter_group = false
  multi_az                  = false


  apply_immediately = true

  tags = merge(var.default_tags)
}

module "rds_sg" {
  source  = "terraform-aws-modules/security-group/aws//modules/mysql"
  version = "~> 5.0"

  name   = "${var.app_name}-rds-sg-${var.environment}"
  vpc_id = var.vpc_id

  ingress_cidr_blocks = concat(
    [var.vpc_cidr],
    var.rds_whitelist_ips
  )

  tags = var.default_tags
}

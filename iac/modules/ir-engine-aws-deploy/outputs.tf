output "rds_endpoint" {
  sensitive = true
  value     = module.rds.db_instance_address
}

output "rds_username" {
  sensitive = true
  value     = module.rds.db_instance_username
}

output "rds_password" {
  sensitive = true
  value     = random_password.mysql_pass.result
}

output "rds_db" {
  value = replace(var.app_name, "/[^a-zA-Z0-9]/", "")
}

output "eks_cluster_primary_sg" {
  value = module.eks_engine_main.cluster_primary_security_group_id
}

output "eks_cluster_sg" {
  value = module.eks_engine_main.cluster_security_group_id
}

output "eks_node_sg" {
  value = module.eks_engine_main.node_security_group_id
}

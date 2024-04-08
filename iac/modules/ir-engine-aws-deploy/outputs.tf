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
  value     = random_password.rds_pass.result
}

output "rds_db" {
  value = replace(var.app_name, "/[^a-zA-Z0-9]/", "")
}

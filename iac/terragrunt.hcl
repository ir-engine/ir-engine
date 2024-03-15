remote_state {
  backend = "s3"
  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
  config = {
    bucket         = "ir-terraform-states"
    dynamodb_table = "sredo-terraform-states"
    key            = "ir-platform/${path_relative_to_include()}/terraform.tfstate"
    encrypt        = true
    region         = "us-east-1"
  }
}

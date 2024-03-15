locals {
  ecr_repos = toset([
    "etherealengine-${var.environment}-builder",
    "etherealengine-${var.environment}-api",
    "etherealengine-${var.environment}-client",
    "etherealengine-${var.environment}-instanceserver",
    "etherealengine-${var.environment}-taskserver"
  ])
}

module "ecr" {
  for_each = local.ecr_repos
  source  = "terraform-aws-modules/ecr/aws"
  version = "~> 1.6"

  repository_name = each.key
  repository_type = "private"
  repository_image_tag_mutability = "MUTABLE"

  repository_read_write_access_arns = [var.ecr_read_write_access_arn]

  create_lifecycle_policy = true
  repository_lifecycle_policy = jsonencode({
    rules = [
      {
        rulePriority = 1,
        description  = "Keep last 15 images",
        selection = {
          tagStatus     = "tagged",
          tagPrefixList = ["v"],
          countType     = "imageCountMoreThan",
          countNumber   = 25
        },
        action = {
          type = "expire"
        }
      }
    ]
  })
  tags = merge(var.default_tags)
}

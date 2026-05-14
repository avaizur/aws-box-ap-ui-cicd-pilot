provider "aws" {
  region = var.aws_region
}

module "networking" {
  source       = "./modules/networking"
  project_name = var.project_name
  vpc_cidr     = var.vpc_cidr
}

module "ecr" {
  source       = "./modules/ecr"
  project_name = var.project_name
}

module "app_runner" {
  source           = "./modules/app_runner"
  project_name     = var.project_name
  vpc_id           = module.networking.vpc_id
  subnet_ids       = module.networking.private_subnets
  image_identifier = "${module.ecr.repository_url}:latest"
  access_role_arn  = var.app_runner_access_role_arn
  container_port   = "8080"
  env_vars = {
    "SPRING_DATASOURCE_URL"       = "jdbc:mysql://${module.rds.db_endpoint}/${var.db_name}?useSSL=false&serverTimezone=UTC"
    "SPRING_DATASOURCE_USERNAME"  = var.db_username
    "SPRING_DATASOURCE_PASSWORD"  = var.db_password
    "SERVER_PORT"                 = "8080"
    "SERVER_SERVLET_CONTEXT_PATH" = "/api"
    "APP_STORAGE_LOCAL_ROOT"      = "./uploads"
  }
}

module "rds" {
  source           = "./modules/rds"
  project_name     = var.project_name
  vpc_id           = module.networking.vpc_id
  subnet_ids       = module.networking.private_subnets
  app_runner_sg_id = module.app_runner.sg_id
  db_name          = var.db_name
  db_username      = var.db_username
  db_password      = var.db_password
}

output "service_url" {
  value = "https://${module.app_runner.service_url}"
}

output "smoke_test_url" {
  value = "https://${module.app_runner.service_url}/api/v3/api-docs"
}

output "rds_endpoint" {
  value = module.rds.db_endpoint
}

output "ecr_repository_url" {
  value = module.ecr.repository_url
}

# IAM Role for App Runner to pull from ECR
resource "aws_iam_role" "app_runner_access_role" {
  name = "${var.project_name}-app-runner-access-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "build.apprunner.amazonaws.com"
        }
      },
    ]
  })
}

resource "aws_iam_role_policy_attachment" "app_runner_ecr_access" {
  role       = aws_iam_role.app_runner_access_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSAppRunnerServicePolicyForECRAccess"
}

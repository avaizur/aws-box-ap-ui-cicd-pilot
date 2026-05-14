resource "aws_security_group" "app_runner" {
  name        = "${var.project_name}-app-runner-sg"
  description = "Security group for App Runner"
  vpc_id      = var.vpc_id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-app-runner-sg"
  }
}

resource "aws_apprunner_vpc_connector" "main" {
  count              = var.deploy_app_runner ? 1 : 0
  vpc_connector_name = "${var.project_name}-vpc-connector"
  subnets            = var.subnet_ids
  security_groups    = [aws_security_group.app_runner.id]
}

resource "aws_apprunner_service" "main" {
  count        = var.deploy_app_runner ? 1 : 0
  service_name = "${var.project_name}-service"

  source_configuration {
    authentication_configuration {
      access_role_arn = var.access_role_arn
    }
    image_repository {
      image_identifier      = var.image_identifier
      image_repository_type = "ECR"
      image_configuration {
        port                          = var.container_port
        runtime_environment_variables = var.env_vars
      }
    }
    auto_deployments_enabled = true
  }

  network_configuration {
    egress_configuration {
      egress_type       = "VPC"
      vpc_connector_arn = aws_apprunner_vpc_connector.main[0].arn
    }
  }

  instance_configuration {
    cpu    = "1 vCPU"
    memory = "2 GB"
  }

  tags = {
    Name = "${var.project_name}-app-runner"
  }
}

output "service_url" {
  value = length(aws_apprunner_service.main) > 0 ? aws_apprunner_service.main[0].service_url : ""
}

output "sg_id" {
  value = aws_security_group.app_runner.id
}

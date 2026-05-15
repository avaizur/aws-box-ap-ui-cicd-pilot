variable "aws_region" {
  type    = string
  default = "eu-west-2"
}

variable "project_name" {
  type    = string
  default = "aws-box-ap-val"
}

variable "vpc_cidr" {
  type    = string
  default = "10.0.0.0/16"
}

variable "db_name" {
  type    = string
  default = "aws_box"
}

variable "db_username" {
  type    = string
  default = "admin"
}

variable "db_password" {
  description = "Database password"
  type        = string
  sensitive   = true
}

variable "deploy_app_runner" {
  description = "Whether to deploy the App Runner service (used to split deployment before image exists)"
  type        = bool
  default     = true
}

variable "app_runner_access_role_arn" {
  type        = string
  description = "ARN of the IAM role for App Runner to access ECR (will be created if not provided)"
  default     = ""
}

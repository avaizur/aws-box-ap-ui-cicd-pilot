variable "project_name" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "image_identifier" {
  type = string
}

variable "access_role_arn" {
  type = string
}

variable "container_port" {
  type    = string
  default = "8080"
}

variable "env_vars" {
  type    = map(string)
  default = {}
}

variable "deploy_app_runner" {
  type    = bool
  default = true
}

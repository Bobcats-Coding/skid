variable "github_owner" {
  type = string
  description = <<EOT
  The GitHub username (or org name) of the owner of the repo that needs 
  access to AWS.
  EOT
}

variable "github_repo" {
  type = string
  description = <<EOT
  The name of the GitHub repo that needs access to AWS (without the username).
  EOT
}

variable "policy_arns" {
  type    = list(string)
  default = []
  description = <<EOT
  The list of the ARNs of the policies that should be attached to the 
  role that it is created. This defined what what the GitHub action
  will have access to in AWS.
  EOT
}

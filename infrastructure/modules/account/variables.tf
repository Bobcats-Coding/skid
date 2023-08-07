variable "main-project-name" {
  type = string
  description = "Name and ID of the project"
}

variable "main-project-roles" {
  type = set(string)
  description = "List of roles to grant to the service account"
  default = []
}

variable "main-project-apis" {
  type = set(string)
  description = "List of APIs to enable"
  default = []
}

variable "projects-to-create" {
  type = map(object({
    name = string
    apis = set(string)
    roles = set(string)
  }))
  description = "List of projects to create"
  default = {}
}

variable "projects-to-access" {
  type = map(object({
    name = string
    roles = set(string)
  }))
  description = "List of projects to access"
  default = {}
}

variable "org-id" {
  type = string
  description = "GCP Organization ID"
}

variable "billing-account" {
  type = string
  description = "GCP Billing Account ID"
}

variable "service-account" {
  type = string
  description = "GCP service account email"
}

variable "name" {
  type = string
  description = "Name and ID of the project"
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

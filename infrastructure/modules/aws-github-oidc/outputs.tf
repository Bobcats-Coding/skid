output "role_arn" {
  value = module.iam_github_oidc_role.arn
  description = "The ARN of the role that is created in the Identity Provider."
}

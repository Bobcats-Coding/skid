# https://github.com/terraform-aws-modules/terraform-aws-iam/blob/v5.32.0/modules/iam-github-oidc-role/README.md

module "iam_github_oidc_provider" {
  source = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-provider"
}

module "iam_github_oidc_role" {
  source    = "terraform-aws-modules/iam/aws//modules/iam-github-oidc-role"
  subjects = ["${var.github_owner}/${var.github_repo}:*"]
}

resource "aws_iam_role_policy_attachment" "policy" {
  for_each = toset(var.policy_arns)

  role = module.iam_github_oidc_role.name
  policy_arn = each.key
}

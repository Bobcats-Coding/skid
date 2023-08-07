locals {
  apis = toset(flatten(concat([
    for project in var.projects-to-create : [
      for api in project.apis : {
        id = "${project.name}-${api}"
        project = project.name
        api = api
      }
    ]
  ], [
    for api in var.main-project-apis : {
      id = "${var.main-project-name}-${api}"
      project = var.main-project-name
      api = api
    }
  ])))

  apis_for_for_each = {
    for api in local.apis : api.id => api
  }

  sub-project-roles = flatten([
    for project in merge(var.projects-to-create, var.projects-to-access) : [
      for role in project.roles : {
        id = "${project.name}-${role}"
        project = project.name
        role = role
      }
    ]
  ])

  sub-project-roles-for-foreach = {
    for role in local.sub-project-roles : role.id => role
  }
}

resource "google_project" "main-project" {
  name = var.main-project-name
  project_id = var.main-project-name
  org_id = var.org-id
  billing_account = var.billing-account
  auto_create_network = false
}

resource "google_project" "sub-projects" {
  for_each = var.projects-to-create
  name = each.value.name
  project_id = each.value.name
  org_id = var.org-id
  billing_account = var.billing-account
  auto_create_network = false
}

resource "google_service_account" "service-account" {
  account_id = var.service-account
  display_name = var.service-account
  project = google_project.main-project.project_id
}

resource "google_project_service" "apis" {
  for_each = local.apis_for_for_each
  project = each.value.project
  service = each.value.api
}

resource "google_project_iam_member" "service-account-main-project-roles" {
  for_each = toset(var.main-project-roles)
  project = google_project.main-project.project_id
  role = "roles/${each.value}"
  member = "serviceAccount:${google_service_account.service-account.email}"
}

resource "google_project_iam_member" "service-account-sub-project-roles" {
  for_each = local.sub-project-roles-for-foreach
  project = each.value.project
  role = "roles/${each.value.role}"
  member = "serviceAccount:${google_service_account.service-account.email}"
}


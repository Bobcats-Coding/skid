output "main-project-id" {
  value = google_project.main-project.project_id
  sensitive = true
}

output "sub-project-ids" {
  value = {
    for key, project in var.projects-to-create : key => project.name
  }
  sensitive = true
}

output "service-account-email" {
  value = google_service_account.service-account.email
}

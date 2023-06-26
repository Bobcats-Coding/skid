output "project-id" {
  value = google_project.project.project_id
}

output "service-account-email" {
  value = google_service_account.service-account.email
}

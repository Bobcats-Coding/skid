output "ssl-certificate" {
  value = "//${google_project_service.certificate_manager.service}/${google_certificate_manager_certificate_map.ssl-certificate-map.id}"
}

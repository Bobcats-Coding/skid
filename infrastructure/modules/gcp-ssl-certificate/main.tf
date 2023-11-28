resource "google_certificate_manager_dns_authorization" "ssl-domain" {
  name = "${var.name}-dns-authorization"
  domain = var.domain
  provider = google.product
}

resource "google_dns_record_set" "ssl-authorization-record" {
  name = google_certificate_manager_dns_authorization.ssl-domain.dns_resource_record[0].name
  type = "CNAME"
  ttl = 30
  managed_zone = var.managed-zone
  rrdatas = [google_certificate_manager_dns_authorization.ssl-domain.dns_resource_record[0].data]
  provider = google.domain
}

resource "google_certificate_manager_certificate" "ssl-certificate" {
  name = "${var.name}-wildcard-certificate"
  scope = "DEFAULT"
  provider = google.product
  managed {
    domains = var.is-wildcard ? [
      google_certificate_manager_dns_authorization.ssl-domain.domain,
      "*.${google_certificate_manager_dns_authorization.ssl-domain.domain}",
    ] : [
      google_certificate_manager_dns_authorization.ssl-domain.domain,
    ]
    dns_authorizations = [
      google_certificate_manager_dns_authorization.ssl-domain.id,
    ]
  }

  depends_on = [
    google_dns_record_set.ssl-authorization-record
  ]
}

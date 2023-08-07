resource "google_certificate_manager_dns_authorization" "ssl-domain" {
  name = "${var.name}-dns-authorization"
  domain = var.domain
  project = var.project-product
  provider = google.product
}

resource "google_project_service" "certificate_manager" {
  service = "certificatemanager.googleapis.com"
  disable_on_destroy = false
  project = var.project-product
  provider = google.product
}


resource "google_dns_record_set" "ssl-authorization-record" {
  name = google_certificate_manager_dns_authorization.ssl-domain.dns_resource_record[0].name
  type = "CNAME"
  ttl = 30
  managed_zone = var.managed-zone
  project = var.project-domain
  rrdatas = [google_certificate_manager_dns_authorization.ssl-domain.dns_resource_record[0].data]
  provider = google.domain
}

resource "google_certificate_manager_certificate" "ssl-certificate" {
  name = "${var.name}-wildcard-certificate"
  scope = "DEFAULT"
  project = var.project-product
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

resource "google_certificate_manager_certificate_map" "ssl-certificate-map" {
  name = "${var.name}-certificate-map"
  description = "Certificate map containing the domain names and sub-domains names for the SSL certificate"
  project = var.project-product
  provider = google.product
}

resource "google_certificate_manager_certificate_map_entry" "ssl-domain-certificate-entry" {
  name = "${var.name}-domain-cert-entry"
  description = "${var.domain} certificate entry"
  project = var.project-product
  provider = google.product
  map = google_certificate_manager_certificate_map.ssl-certificate-map.name
  certificates = [google_certificate_manager_certificate.ssl-certificate.id]
  hostname = google_certificate_manager_dns_authorization.ssl-domain.domain
}

resource "google_certificate_manager_certificate_map_entry" "ssl-sub_domain_certificate_entry" {
  count = var.is-wildcard ? 1 : 0
  name = "${var.name}-sub-domain-entry"
  description = "*.${var.domain} certificate entry"
  project = var.project-product
  provider = google.product
  map = google_certificate_manager_certificate_map.ssl-certificate-map.name
  certificates = [google_certificate_manager_certificate.ssl-certificate.id]
  hostname = "*.${google_certificate_manager_dns_authorization.ssl-domain.domain}"
}

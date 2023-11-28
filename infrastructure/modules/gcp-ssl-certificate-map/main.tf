resource "google_project_service" "certificate_manager" {
  service = "certificatemanager.googleapis.com"
  disable_on_destroy = false
  provider = google.product
}

resource "google_certificate_manager_certificate_map" "ssl-certificate-map" {
  name = "${var.name}-certificate-map"
  description = "Certificate map containing the domain names and sub-domains names for the SSL certificate"
  provider = google.product
  lifecycle {
    create_before_destroy = true
  }
}

module "ssl-certificate" {
  source = "../gcp-ssl-certificate"
  for_each = var.certificates
  name = each.key
  domain = each.value.domain
  managed-zone = each.value.managed-zone
  is-wildcard = each.value.is-wildcard
  providers = {
    google.product = google.product
    google.domain = google.domain
  }
}

resource "google_certificate_manager_certificate_map_entry" "ssl-domain-certificate-entry" {
  for_each = var.certificates
  name = "${each.key}-domain-cert-entry"
  description = "${each.value.domain} certificate entry"
  provider = google.product
  map = google_certificate_manager_certificate_map.ssl-certificate-map.name
  certificates = [module.ssl-certificate[each.key].ssl-certificate]
  hostname = each.value.domain
  lifecycle {
    create_before_destroy = true
  }
}

locals {
  wildcard-certificates = { for k, v in var.certificates :  k => v if v.is-wildcard == true }
}

resource "google_certificate_manager_certificate_map_entry" "ssl-sub-domain-certificate-entry" {
  for_each = local.wildcard-certificates
  name = "${each.key}-sub-domain-entry"
  description = "*.${each.value.domain} certificate entry"
  provider = google.product
  map = google_certificate_manager_certificate_map.ssl-certificate-map.name
  certificates = [module.ssl-certificate[each.key].ssl-certificate]
  hostname = "*.${each.value.domain}"
  lifecycle {
    create_before_destroy = true
  }
}

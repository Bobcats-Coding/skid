resource "google_dns_managed_zone" "sub-dns-zone" {
  name = "${var.name}-sub-dns-zone-prod"
  dns_name = "${var.sub-domain}.${var.top-domain}."
  description = var.description
  visibility = "public"
  dnssec_config {
    state = "on"
    kind = "dns#managedZoneDnsSecConfig"
    non_existence = "nsec3"
  }
  labels = {
    "managed-by" = "terraform"
  }
  provider = google.sub
}

data "google_dns_keys" "sub-zone-dns-keys" {
  managed_zone = google_dns_managed_zone.sub-dns-zone.name
  depends_on   = [google_dns_managed_zone.sub-dns-zone]
  provider = google.sub
}

resource "google_dns_record_set" "sub-dns-zone-ds" {
  name         = "${var.sub-domain}.${var.top-domain}."
  managed_zone = var.parent-managed-zone
  type         = "DS"
  ttl          = 300
  rrdatas      = [data.google_dns_keys.sub-zone-dns-keys.key_signing_keys[0].ds_record]
  provider = google.parent
}

resource "google_dns_record_set" "sub-dns-zone-ns" {
  name         = "${var.sub-domain}.${var.top-domain}."
  managed_zone = var.parent-managed-zone
  type         = "NS"
  ttl          = 300
  rrdatas      = google_dns_managed_zone.sub-dns-zone.name_servers
  provider     = google.parent
}

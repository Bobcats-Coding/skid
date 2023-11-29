locals {
  certificates = { for k, v in var.domains-to-certify :
    k => {
      domain = v.domain
      managed-zone = module.sub-domain[k].sub-dns-zone-name
      is-wildcard = true
    }
  }
  services = { for k, v in var.cloud-run-services :
    k => {
      domain = v.domain
      managed-zone = module.sub-domain[v.domain-key].sub-dns-zone-name
      service = v.service
      path = v.path
    }
  }
}

module "sub-domain" {
  for_each = var.domains-to-certify
  source = "../gcp-sub-domain"
  name = each.key
  top-domain = each.value.top-domain
  sub-domain = each.value.sub-domain
  parent-managed-zone = each.value.managed-zone
  description = "Stage DNS sub-zone for the Bars app"
  providers = {
    google.parent = google.domain-parent
    google.sub = google.domain
  }
}

module "default-public-bucket" {
  source = "../gcp-public-bucket"
  name = "${var.name}-global-routing"
  location = var.location
  providers = {
    google = google.product
  }
}

resource "google_storage_bucket_object" "default-index" {
  name   = "index.html"
  bucket = module.default-public-bucket.bucket-name
  content = "<html><body><h1>Bars.com</h1></body></html>"
  content_type = "text/html"
  provider = google.product
}

resource "google_storage_bucket_object" "default-404" {
  name   = "404.html"
  bucket = module.default-public-bucket.bucket-name
  content = "<html><body><h1>404: Page Not Found</h1></body></html>"
  content_type = "text/html"
  provider = google.product
}

# load balancer
module "bars-com-stage-load-balancer" {
  source = "../gcp-load-balancer"
  name = "${var.name}-global-routing"
  default-service = module.default-public-bucket.service
  services = local.services
  ssl-certificate-map = module.ssl-certificates.ssl-certificate-map
  providers = {
    google.product = google.product
    google.domain = google.domain
  }
}

module "ssl-certificates" {
  source = "../gcp-ssl-certificate-map"
  name = "${var.name}-global-routing"
  certificates = local.certificates
  providers = {
    google.product = google.product
    google.domain = google.domain
  }
}

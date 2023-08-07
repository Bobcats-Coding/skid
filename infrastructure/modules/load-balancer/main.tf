resource "google_compute_global_address" "static-ip" {
  name = "${var.name}-${terraform.workspace}-static-ip"
  provider = google.product
}

resource "google_compute_url_map" "http-url-map" {
  name = "${var.name}-${terraform.workspace}-http-url-map"

  default_url_redirect {
    https_redirect = true
    strip_query = false
  }
  provider = google.product
}


resource "google_compute_url_map" "https-url-map" {
  name = "${var.name}-${terraform.workspace}-https-url-map"
  default_service = var.service

  host_rule {
    hosts = ["*"]
    path_matcher = "allpaths"
  }

  path_matcher {
    name = "allpaths"
    default_service = var.service

    dynamic "path_rule" {
      for_each = var.is-index-html-redirect ? [1] : []
      content {
        paths = ["/"]
        service = var.service
        route_action {
          url_rewrite {
            path_prefix_rewrite = "/index.html"
          }
        }
      }
    }
  }
  provider = google.product
}

resource "google_compute_target_https_proxy" "https-proxy" {
  name = "${var.name}-${terraform.workspace}-https-proxy"
  url_map = google_compute_url_map.https-url-map.self_link
  certificate_map = var.ssl-certificate
  provider = google.product
}

resource "google_compute_target_http_proxy" "http-proxy" {
  name = "${var.name}-${terraform.workspace}-http-proxy"
  url_map = google_compute_url_map.http-url-map.self_link
  provider = google.product
}

resource "google_compute_global_forwarding_rule" "https-forwarding-rule" {
  name = "${var.name}-${terraform.workspace}-https-forwarding-rule"
  target = google_compute_target_https_proxy.https-proxy.self_link
  ip_address = google_compute_global_address.static-ip.address
  port_range = "443"
  provider = google.product
}

resource "google_compute_global_forwarding_rule" "http-redirect" {
  name = "${var.name}-${terraform.workspace}-http-redirect-rule"
  target = google_compute_target_http_proxy.http-proxy.self_link
  ip_address = google_compute_global_address.static-ip.address
  port_range = "80"
  provider = google.product
}

resource "google_dns_record_set" "frontend" {
  name = "${var.domain}."
  type = "A"
  ttl = 300
  managed_zone = var.managed-zone
  rrdatas = [google_compute_global_address.static-ip.address]
  provider = google.domain
}

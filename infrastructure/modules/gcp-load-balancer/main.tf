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
  default_service = var.default-service

  dynamic host_rule {
    for_each = var.services
    content {
      hosts = [host_rule.value.domain]
      path_matcher = "path-matcher-${replace(host_rule.value.domain, ".", "-")}"
    }
  }

  dynamic "path_matcher" {
    for_each = var.services
    content {
      name = "path-matcher-${replace(path_matcher.value.domain, ".", "-")}"
      default_service = var.default-service

      path_rule {
        paths = [path_matcher.value.path]
        service = path_matcher.value.service
      }

      dynamic "path_rule" {
        for_each = path_matcher.value.is-index-html-redirect ? [1] : []
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
  }
  provider = google.product
}

resource "google_compute_target_https_proxy" "https-proxy" {
  name = "${var.name}-${terraform.workspace}-https-proxy"
  url_map = google_compute_url_map.https-url-map.self_link
  certificate_map = var.ssl-certificate-map
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
  for_each = var.services
  name = "${each.value.domain}."
  type = "A"
  ttl = 300
  managed_zone = each.value.managed-zone
  rrdatas = [google_compute_global_address.static-ip.address]
  provider = google.domain
}

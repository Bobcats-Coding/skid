resource "google_cloud_run_service" "web-ssr" {
  name = "${var.name}-${terraform.workspace}-web-ssr-cloud-run"
  location = var.region

  template {
    spec {
      containers {
        image = var.image
        dynamic "env" {
          for_each = var.environment-variables
          content {
            name = env.key
            value = env.value
          }
        }
        dynamic "env" {
          for_each = var.secrets
          content {
            name = env.key
            value_from {
              secret_key_ref {
                name = env.value
                key = "latest"
              }
            }
          }
        }
      }
    }
  }

  traffic {
    percent = 100
    latest_revision = true
  }
  provider = google.product
}

resource "google_compute_backend_service" "web-ssr-backend" {
  name = "${var.name}-${terraform.workspace}-web-ssr-backend-service"
  enable_cdn = true

  backend {
    group = google_compute_region_network_endpoint_group.web-ssr-neg.id
  }
  provider = google.product
}

resource "google_compute_region_network_endpoint_group" "web-ssr-neg" {
  name = "${var.name}-${terraform.workspace}-web-ssr-neg"
  network_endpoint_type = "SERVERLESS"
  region = var.region
  cloud_run {
    service = google_cloud_run_service.web-ssr.name
  }
  provider = google.product
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"

    members = [
      "allUsers",
    ]
  }
  provider = google.product
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_service.web-ssr.location
  project = google_cloud_run_service.web-ssr.project
  service = google_cloud_run_service.web-ssr.name

  policy_data = data.google_iam_policy.noauth.policy_data
  provider = google.product
}

locals {
  resource-pool-object-content = {
    "service" = google_compute_backend_service.web-ssr-backend.self_link
    "domain" = var.domain
    "path" = "/*"
  }
  load-balancer-rendered-json = jsonencode(local.resource-pool-object-content)
}

resource "google_storage_bucket_object" "resource-pool" {
  name   = "${terraform.workspace}-web-ssr-${var.name}.json"
  bucket = var.resource-pool-bucket
  content = local.load-balancer-rendered-json
  provider = google.product
}

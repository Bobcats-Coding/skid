resource "google_cloud_run_service" "api" {
  name = "${var.name}-${terraform.workspace}-api-cloud-run"
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
  provider = google
}

data "google_iam_policy" "noauth" {
  binding {
    role = "roles/run.invoker"

    members = [
      "allUsers",
    ]
  }
  provider = google
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  location = google_cloud_run_service.api.location
  project = google_cloud_run_service.api.project
  service = google_cloud_run_service.api.name

  policy_data = data.google_iam_policy.noauth.policy_data
  provider = google
}

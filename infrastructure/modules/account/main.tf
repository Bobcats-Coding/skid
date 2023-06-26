resource "google_project" "project" {
  name = var.name
  project_id = var.name
  org_id = var.org-id
  billing_account = var.billing-account
  auto_create_network = false
}

resource "google_service_account" "service-account" {
  account_id = var.service-account
  display_name = var.service-account
  project = google_project.project.project_id
}

resource "google_project_service" "certificatemanager-api" {
  project = google_project.project.project_id
  service = "certificatemanager.googleapis.com"
}

resource "google_project_service" "dns-api" {
  project = google_project.project.project_id
  service = "dns.googleapis.com"
}

resource "google_project_service" "compute-engine-api" {
  project = google_project.project.project_id
  service = "compute.googleapis.com"
}

resource "google_project_service" "cloud-run-api" {
  project = google_project.project.project_id
  service = "run.googleapis.com"
}

resource "google_project_service" "secret-manager-api" {
  project = google_project.project.project_id
  service = "secretmanager.googleapis.com"
}

resource "google_project_service" "iamcredentials-api" {
  project = google_project.project.project_id
  service = "iamcredentials.googleapis.com"
}

resource "google_project_service" "iam-api" {
  project = google_project.project.project_id
  service = "iam.googleapis.com"
}

resource "google_project_service" "cloudresourcemanager-api" {
  project = google_project.project.project_id
  service = "cloudresourcemanager.googleapis.com"
}

resource "google_project_service" "sts-api" {
  project = google_project.project.project_id
  service = "sts.googleapis.com"
}

resource "google_project_iam_member" "service-account-storage-role" {
  project = google_project.project.project_id
  role = "roles/storage.admin"
  member = "serviceAccount:${google_service_account.service-account.email}"
}

resource "google_project_iam_member" "service-account-secret-accessor-role" {
  project = google_project.project.project_id
  role = "roles/secretmanager.secretAccessor"
  member = "serviceAccount:${google_service_account.service-account.email}"
}

resource "google_project_iam_member" "service-account-kms-role" {
  project = google_project.project.project_id
  role = "roles/cloudkms.admin"
  member = "serviceAccount:${google_service_account.service-account.email}"
}

resource "google_project_iam_member" "service-dns-admin-role" {
  project = google_project.project.project_id
  role = "roles/dns.admin"
  member = "serviceAccount:${google_service_account.service-account.email}"
}

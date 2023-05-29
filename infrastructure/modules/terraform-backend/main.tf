resource "google_storage_bucket" "terraform-backend-bucket" {
  project = var.project
  name = "${var.name}-terraform-backend-bucket"
  location = var.region
  force_destroy = true
  storage_class = var.storage-class
  versioning {
    enabled = true
  }
}

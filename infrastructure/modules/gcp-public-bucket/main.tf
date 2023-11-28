# The bucket is public, so it is not necessary to encrypt it
# tfsec:ignore:google-storage-bucket-encryption-customer-key
resource "google_storage_bucket" "public-bucket" {
  name = "${var.name}-${terraform.workspace}-public-bucket"
  location = var.location
  force_destroy = true
  uniform_bucket_level_access = true
   website {
    main_page_suffix = "index.html"
    not_found_page = "404.html"
  }
}

resource "google_storage_bucket_iam_policy" "public-bucket-iam-policy" {
  bucket = google_storage_bucket.public-bucket.name

  policy_data = <<EOF
{
  "bindings": [
    {
      "role": "roles/storage.objectViewer",
      "members": [
        "allUsers"
      ]
    }
  ]
}
EOF
}

resource "google_compute_backend_bucket" "public-backend-bucket" {
  name = "${var.name}-${terraform.workspace}-public-bucket"
  bucket_name = google_storage_bucket.public-bucket.name
  enable_cdn = true
  lifecycle {
    create_before_destroy = true
  }
}

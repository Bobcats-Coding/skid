locals {
  all-files = tolist(fileset(var.directory, "**/*.*"))
  content_types = {
    ".html" = "text/html",
    ".css" = "text/css",
    ".js" = "application/javascript",
    ".json" = "application/json",
    ".png" = "image/png",
    ".xml" = "application/xml",
    ".ico" = "image/x-icon",
    ".svg" = "image/svg+xml",
    ".txt" = "text/plain"
    ".jpg" = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif" = "image/gif"
    ".mp3" = "audio/mpeg"
    ".mp4" = "video/mp4"
    ".wav" = "audio/wav"
    ".ogg" = "audio/ogg"
    ".ogv" = "video/ogg"
    ".webm" = "video/webm"
    ".ttf" = "font/ttf"
    ".otf" = "font/otf"
    ".woff" = "font/woff"
    ".woff2" = "font/woff2"
    ".eot" = "application/vnd.ms-fontobject"
    ".sfnt" = "application/font-sfnt"
    ".zip" = "policy_datapplication/zip"
    ".gz" = "application/gzip"
    ".tar" = "application/x-tar"
    ".flv" = "video/x-flv"
    ".wmv" = "video/x-ms-wmv"
    ".avi" = "video/x-msvideo"
    ".webp" = "image/webp"
    ".weba" = "audio/webm"
    ".m4a" = "audio/mp4"
    ".aac" = "audio/aac"
    ".m4v" = "video/x-m4v"
    ".f4v" = "video/x-f4v"
    ".f4p" = "video/x-f4p"
    ".f4a" = "audio/mp4"
    ".f4b" = "audio/mp4"
    ".cur" = "image/x-icon"
    ".vcf" = "text/x-vcard"
    ".csv" = "text/csv"
  }
}

#tfsec:ignore:google-storage-bucket-encryption-customer-key
resource "google_storage_bucket" "web-spa-frontend-bucket" {
  name = "${var.name}-${terraform.workspace}-web-spa-frontend-bucket"
  location = var.location
  force_destroy = true
  uniform_bucket_level_access = true
   website {
    main_page_suffix = "index.html"
    not_found_page = "index.html"
  }
}

resource "google_storage_bucket_iam_policy" "web-spa-bucket-iam-policy" {
  bucket = google_storage_bucket.web-spa-frontend-bucket.name

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

resource "google_storage_bucket_object" "object" {
  count = length(local.all-files)
  name = local.all-files[count.index]
  bucket = google_storage_bucket.web-spa-frontend-bucket.name
  source = "${var.directory}/${local.all-files[count.index]}"
  # It does not handle nested folders
  content_type = lookup(local.content_types, regex("\\.[^.]*$", element(local.all-files, count.index)), "text/plain")
}

resource "google_compute_backend_bucket" "web-spa-backend-bucket" {
  name = "${var.name}-${terraform.workspace}-web-spa-backend-bucket"
  bucket_name = google_storage_bucket.web-spa-frontend-bucket.name
  enable_cdn = true
}

module "web-spa-domain" {
  source = "../custom-domain"
  name = "${var.name}-web-spa"
  domain = var.domain
  managed-zone = var.managed-zone
  ssl-certificate = var.ssl-certificate
  service = google_compute_backend_bucket.web-spa-backend-bucket.self_link
  is-index-html-redirect = true
  providers = {
    google = google
  }
}

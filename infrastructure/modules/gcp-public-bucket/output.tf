output "service" {
  value = google_compute_backend_bucket.public-backend-bucket.self_link
}

output "bucket-name" {
  value = google_storage_bucket.public-bucket.name
}

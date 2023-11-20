resource "google_storage_bucket" "resource-pool-bucket" {
  name = "${var.name}-resource-pool-bucket"
  location = var.region
  force_destroy = true
  storage_class = var.storage-class

  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }

  encryption {
    default_kms_key_name = google_kms_crypto_key.resource-pool-crypto-key.id
  }

  labels = {
    "managed-by" = "terraform"
  }
}

resource "google_kms_key_ring" "resource-pool-keyring" {
  name = "${var.name}-resource-pool-key-ring"
  location = var.region

}

resource "google_kms_crypto_key" "resource-pool-crypto-key" {
  name = "${var.name}-resource-pool-crypto-key"
  key_ring = google_kms_key_ring.resource-pool-keyring.id
}

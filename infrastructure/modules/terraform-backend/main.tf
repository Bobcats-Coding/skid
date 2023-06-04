resource "google_storage_bucket" "terraform-backend-bucket" {
  project = var.project
  name = "${var.name}-terraform-backend-bucket"
  location = var.region
  force_destroy = true
  storage_class = var.storage-class

  uniform_bucket_level_access = true
  versioning {
    enabled = true
  }

  encryption {
    default_kms_key_name = google_kms_crypto_key.terraform-backend-crypto-key.id
  }

  labels = {
    "managed-by" = "terraform"
  }
}

resource "google_kms_key_ring" "terraform-backend-keyring" {
  name = "${var.name}-terraform-backend-keyring"
  location = var.region
  labels = {
    "managed-by" = "terraform"
  }
}

resource "google_kms_crypto_key" "terraform-backend-crypto-key" {
  name = "${var.name}-terraform-backend-cryptokey"
  key_ring = google_kms_key_ring.terraform-backend-keyring.id
  labels = {
    "managed-by" = "terraform"
  }
}

locals {
  default_table_name  = var.iceberg_table_name != "" ? var.iceberg_table_name : var.name
  iceberg_root_prefix = trim(var.iceberg_root_prefix, "/")

  tables_input = length(var.tables) > 0 ? var.tables : {
    (local.default_table_name) = {
      metadata_ttl_days = var.metadata_ttl_days
      data_ttl_days     = var.data_ttl_days
    }
  }

  iceberg_tables = {
    for table_name, cfg in local.tables_input : table_name => {
      metadata_ttl_days = coalesce(lookup(cfg, "metadata_ttl_days", null), var.metadata_ttl_days)
      data_ttl_days     = coalesce(lookup(cfg, "data_ttl_days", null), var.data_ttl_days)
      base_prefix       = local.iceberg_root_prefix != "" ? "${local.iceberg_root_prefix}/${table_name}" : table_name
      metadata_prefix   = local.iceberg_root_prefix != "" ? "${local.iceberg_root_prefix}/${table_name}/metadata" : "${table_name}/metadata"
      data_prefix       = local.iceberg_root_prefix != "" ? "${local.iceberg_root_prefix}/${table_name}/data" : "${table_name}/data"
    }
  }

  primary_table_name = contains(keys(local.iceberg_tables), local.default_table_name) ? local.default_table_name : element(sort(keys(local.iceberg_tables)), 0)
}

resource "google_kms_key_ring" "durable_key_ring" {
  name     = "${var.name}-durable-key-ring"
  location = var.region
}

resource "google_kms_crypto_key" "durable_crypto_key" {
  name            = "${var.name}-durable-crypto-key"
  key_ring        = google_kms_key_ring.durable_key_ring.id
  rotation_period = var.kms_rotation_period
}

resource "google_storage_bucket" "durable_bucket" {
  name                        = "${var.name}-durable-bucket"
  location                    = var.region
  storage_class               = var.storage_class
  force_destroy               = var.force_destroy
  uniform_bucket_level_access = true

  versioning {
    enabled = true
  }

  encryption {
    default_kms_key_name = google_kms_crypto_key.durable_crypto_key.id
  }

  labels = merge({
    "managed-by" = "terraform"
    "purpose"    = "iceberg"
  }, var.labels)

  dynamic "retention_policy" {
    for_each = var.retention_period_seconds > 0 ? [1] : []
    content {
      retention_period = var.retention_period_seconds
    }
  }

  dynamic "lifecycle_rule" {
    for_each = { for table_name, cfg in local.iceberg_tables : table_name => cfg if cfg.metadata_ttl_days > 0 }
    content {
      action {
        type = "Delete"
      }

      condition {
        matches_prefix = [lifecycle_rule.value.metadata_prefix]
        age            = lifecycle_rule.value.metadata_ttl_days
      }
    }
  }

  dynamic "lifecycle_rule" {
    for_each = { for table_name, cfg in local.iceberg_tables : table_name => cfg if cfg.data_ttl_days > 0 }
    content {
      action {
        type = "Delete"
      }

      condition {
        matches_prefix = [lifecycle_rule.value.data_prefix]
        age            = lifecycle_rule.value.data_ttl_days
      }
    }
  }
}


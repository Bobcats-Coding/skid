output "name" {
  value       = google_storage_bucket.durable_bucket.name
  description = "Name of the storage bucket"
}

output "iceberg_warehouse_uri" {
  value       = format("gs://%s/%s", google_storage_bucket.durable_bucket.name, local.iceberg_root_prefix)
  description = "GCS URI for the Iceberg warehouse root (use as warehouseLocation for Hadoop catalog)"
}

output "iceberg_table_uri" {
  value       = format("gs://%s/%s", google_storage_bucket.durable_bucket.name, local.iceberg_tables[local.primary_table_name].base_prefix)
  description = "Root GCS URI of the primary Iceberg table"
}

output "iceberg_metadata_uri" {
  value       = format("gs://%s/%s", google_storage_bucket.durable_bucket.name, local.iceberg_tables[local.primary_table_name].metadata_prefix)
  description = "GCS URI for the primary Iceberg table metadata files"
}

output "iceberg_data_uri" {
  value       = format("gs://%s/%s", google_storage_bucket.durable_bucket.name, local.iceberg_tables[local.primary_table_name].data_prefix)
  description = "GCS URI for the primary Iceberg table data files"
}

output "kms_key_name" {
  value       = google_kms_crypto_key.durable_crypto_key.id
  description = "CMEK crypto key protecting the bucket"
}

output "iceberg_tables" {
  value = {
    for table_name, cfg in local.iceberg_tables : table_name => {
      table_uri    = format("gs://%s/%s", google_storage_bucket.durable_bucket.name, cfg.base_prefix)
      metadata_uri = format("gs://%s/%s", google_storage_bucket.durable_bucket.name, cfg.metadata_prefix)
      data_uri     = format("gs://%s/%s", google_storage_bucket.durable_bucket.name, cfg.data_prefix)
    }
  }
  description = "Per-table URIs for all Iceberg tables configured in this bucket"
}

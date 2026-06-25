resource "google_bigquery_dataset" "dataset" {
  dataset_id = var.dataset_id
  project    = var.project
  location   = var.location

  friendly_name = var.friendly_name != "" ? var.friendly_name : null
  description   = var.description != "" ? var.description : null

  labels = merge({
    "managed-by" = "terraform"
  }, var.labels)

  delete_contents_on_destroy      = var.delete_contents_on_destroy
  default_table_expiration_ms     = var.default_table_expiration_ms
  default_partition_expiration_ms = var.default_partition_expiration_ms
}
locals {
  iceberg_table_settings = {
    for table_name, cfg in var.iceberg_tables : table_name => {
      labels        = merge(var.table_labels, cfg.labels)
      autodetect    = cfg.autodetect
      source_uris   = length(cfg.source_uris) > 0 ? cfg.source_uris : [cfg.metadata_uri]
      connection_id = cfg.connection_id
    }
  }
}

resource "google_bigquery_table" "iceberg_tables" {
  for_each   = local.iceberg_table_settings
  project    = var.project
  dataset_id = google_bigquery_dataset.dataset.dataset_id
  table_id   = each.key

  labels = each.value.labels

  external_data_configuration {
    autodetect    = each.value.autodetect
    source_format = "ICEBERG"
    source_uris   = each.value.source_uris
    connection_id = each.value.connection_id
  }

  depends_on = [google_bigquery_dataset.dataset]
}

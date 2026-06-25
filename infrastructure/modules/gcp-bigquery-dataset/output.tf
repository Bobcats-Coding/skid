output "dataset_id" {
  value       = google_bigquery_dataset.dataset.dataset_id
  description = "Dataset identifier"
}

output "dataset_project" {
  value       = google_bigquery_dataset.dataset.project
  description = "Project containing the dataset"
}

output "dataset_resource_id" {
  value       = google_bigquery_dataset.dataset.id
  description = "Fully qualified dataset resource name"
}

output "self_link" {
  value       = google_bigquery_dataset.dataset.self_link
  description = "API self link for the dataset"
}

output "iceberg_table_ids" {
  value       = { for name, table in google_bigquery_table.iceberg_tables : name => table.id }
  description = "Fully qualified resource IDs for Iceberg tables created by the module"
}

output "iceberg_table_names" {
  value       = { for name, table in google_bigquery_table.iceberg_tables : name => table.table_id }
  description = "Table IDs for Iceberg tables created by the module"
}

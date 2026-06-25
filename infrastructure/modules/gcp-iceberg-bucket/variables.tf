variable "name" {
  type        = string
  description = "Prefix used when naming durable bucket resources"
}

variable "region" {
  type        = string
  description = "Region or multi-region for the bucket and KMS key"
}

variable "storage_class" {
  type        = string
  default     = "STANDARD"
  description = "GCS storage class for data"
}

variable "force_destroy" {
  type        = bool
  default     = false
  description = "Force bucket destroy even when not empty"
}

variable "kms_rotation_period" {
  type        = string
  default     = "7776000s"
  description = "Rotation period for the customer-managed encryption key"
}

variable "retention_period_seconds" {
  type        = number
  default     = 0
  description = "Optional object retention period in seconds; zero disables retention"
}

variable "labels" {
  type        = map(string)
  default     = {}
  description = "Additional labels applied to the bucket"
}

variable "project" {
  type        = string
  description = "GCP project"
}

variable "iceberg_table_name" {
  type        = string
  default     = ""
  description = "Logical Iceberg table name used when no explicit tables map is provided; defaults to `name` when empty"
}

variable "iceberg_root_prefix" {
  type        = string
  default     = "iceberg"
  description = "Top-level prefix inside the bucket for Iceberg tables"
}

variable "metadata_ttl_days" {
  type        = number
  default     = 0
  description = "Default TTL (days) for metadata files; zero keeps them indefinitely"
}

variable "data_ttl_days" {
  type        = number
  default     = 0
  description = "Default TTL (days) for data files; zero keeps them indefinitely"
}

variable "tables" {
  description = "Optional map of Iceberg table configurations keyed by table name"
  type = map(object({
    metadata_ttl_days = optional(number)
    data_ttl_days     = optional(number)
  }))
  default = {}
}

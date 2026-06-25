variable "project" {
  type        = string
  description = "GCP project that will own the dataset"
}

variable "dataset_id" {
  type        = string
  description = "Dataset identifier; must be unique within the project"
}

variable "location" {
  type        = string
  description = "Dataset geographic location"
}

variable "friendly_name" {
  type        = string
  default     = ""
  description = "Optional friendly name for the dataset"
}

variable "description" {
  type        = string
  default     = ""
  description = "Optional description of the dataset"
}

variable "labels" {
  type        = map(string)
  default     = {}
  description = "Additional labels applied to the dataset"
}

variable "delete_contents_on_destroy" {
  type        = bool
  default     = false
  description = "When true, delete dataset tables when the dataset is destroyed"
}

variable "default_table_expiration_ms" {
  type        = number
  default     = null
  description = "Default expiration for tables in milliseconds; null keeps tables indefinitely"
}

variable "default_partition_expiration_ms" {
  type        = number
  default     = null
  description = "Default expiration for partitioned tables in milliseconds; null keeps partitions indefinitely"
}

variable "iceberg_tables" {
  description = "Optional map declaring Iceberg tables to be registered in this dataset"
  type = map(object({
    metadata_uri  = string
    labels        = optional(map(string), {})
    autodetect    = optional(bool, false)
    connection_id = optional(string)
    source_uris   = optional(list(string), [])
  }))
  default = {}
}

variable "table_labels" {
  type        = map(string)
  default     = {}
  description = "Labels applied to all tables created by this module"
}

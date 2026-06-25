variable "project" {
  type        = string
  description = "GCP project ID"
}

variable "region" {
  type        = string
  description = "GCP region for the Dataflow job"
}

variable "job_name" {
  type        = string
  description = "Name of the Dataflow job"
}

variable "container_spec_gcs_path" {
  type        = string
  description = "GCS path to the Flex Template spec file (e.g., gs://bucket/templates/template.json)"
}

variable "parameters" {
  type        = map(string)
  default     = {}
  description = "Parameters to pass to the Dataflow job template"
}

variable "labels" {
  type        = map(string)
  default     = {}
  description = "Labels to apply to the Dataflow job"
}

variable "max_workers" {
  type        = number
  default     = 10
  description = "Maximum number of workers"
}

variable "num_workers" {
  type        = number
  default     = 1
  description = "Initial number of workers"
}

variable "machine_type" {
  type        = string
  default     = "n1-standard-2"
  description = "Machine type for Dataflow workers"
}

variable "network" {
  type        = string
  default     = ""
  description = "VPC network for Dataflow workers"
}

variable "subnetwork" {
  type        = string
  default     = ""
  description = "VPC subnetwork for Dataflow workers"
}

variable "temp_gcs_location" {
  type        = string
  description = "GCS path for temporary files (e.g., gs://bucket/temp)"
}

variable "staging_gcs_location" {
  type        = string
  default     = ""
  description = "GCS path for staging files; defaults to temp_gcs_location if empty"
}

variable "enable_streaming_engine" {
  type        = bool
  default     = true
  description = "Enable Streaming Engine for the job"
}

variable "on_delete" {
  type        = string
  default     = "drain"
  description = "Action on job deletion: 'drain' or 'cancel'"
}

variable "skip_wait_on_job_termination" {
  type        = bool
  default     = false
  description = "Skip waiting for job termination on destroy"
}

variable "pubsub_subscription_id" {
  type        = string
  default     = ""
  description = "Pub/Sub subscription ID to grant subscriber permissions (optional)"
}

variable "gcs_bucket_name" {
  type        = string
  default     = ""
  description = "GCS bucket name to grant write permissions (optional)"
}

variable "bigquery_dataset_id" {
  type        = string
  default     = ""
  description = "BigQuery dataset ID to grant data editor permissions (optional)"
}

variable "kms_key_id" {
  type        = string
  default     = ""
  description = "KMS key ID to grant encrypt/decrypt permissions (optional)"
}

variable "template_version" {
  type        = string
  default     = "initial"
  description = "Version identifier for the template (e.g., git commit SHA). Changing this forces job replacement."
}

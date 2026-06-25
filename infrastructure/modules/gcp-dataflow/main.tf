locals {
  staging_gcs_location = var.staging_gcs_location != "" ? var.staging_gcs_location : var.temp_gcs_location
  # Use short hash of template_version to create unique job names
  # This allows new jobs to start while old ones are still draining
  version_suffix = substr(var.template_version, 0, 8)
  job_name       = var.template_version != "initial" ? "${var.job_name}-${local.version_suffix}" : var.job_name
}

resource "google_dataflow_flex_template_job" "job" {
  provider                = google-beta
  name                    = local.job_name
  project                 = var.project
  region                  = var.region
  container_spec_gcs_path = var.container_spec_gcs_path

  parameters = merge({
    tempLocation    = var.temp_gcs_location
    stagingLocation = local.staging_gcs_location
  }, var.parameters)

  labels = merge({
    "managed-by" = "terraform"
  }, var.labels)

  on_delete                    = var.on_delete
  skip_wait_on_job_termination = var.skip_wait_on_job_termination

  additional_experiments = var.enable_streaming_engine ? ["enable_streaming_engine"] : []

  lifecycle {
    ignore_changes = [
      parameters["tempLocation"],
      parameters["stagingLocation"],
    ]
    # Force replacement when template_version changes (set by CI after building new image)
    replace_triggered_by = [
      null_resource.template_version
    ]
  }
}

# This resource is used to trigger job replacement when the template version changes
# The CI pipeline should update template_version after building a new Docker image
resource "null_resource" "template_version" {
  triggers = {
    version = var.template_version
  }
}

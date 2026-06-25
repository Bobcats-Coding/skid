output "job_id" {
  value       = google_dataflow_flex_template_job.job.job_id
  description = "The unique ID of the Dataflow job"
}

output "job_name" {
  value       = google_dataflow_flex_template_job.job.name
  description = "The name of the Dataflow job"
}

output "job_state" {
  value       = google_dataflow_flex_template_job.job.state
  description = "The current state of the Dataflow job"
}

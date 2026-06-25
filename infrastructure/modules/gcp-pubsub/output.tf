output "topic_id" {
  value       = google_pubsub_topic.topic.id
  description = "The ID of the Pub/Sub topic"
}

output "topic_name" {
  value       = google_pubsub_topic.topic.name
  description = "The name of the Pub/Sub topic"
}

output "subscription_id" {
  value       = var.create_subscription ? google_pubsub_subscription.subscription[0].id : null
  description = "The ID of the Pub/Sub subscription"
}

output "subscription_name" {
  value       = var.create_subscription ? google_pubsub_subscription.subscription[0].name : null
  description = "The name of the Pub/Sub subscription"
}

output "dead_letter_topic_id" {
  value       = var.enable_dead_letter ? google_pubsub_topic.dead_letter[0].id : null
  description = "The ID of the dead-letter topic"
}

output "dead_letter_topic_name" {
  value       = var.enable_dead_letter ? google_pubsub_topic.dead_letter[0].name : null
  description = "The name of the dead-letter topic"
}

output "dead_letter_subscription_id" {
  value       = var.enable_dead_letter ? google_pubsub_subscription.dead_letter_subscription[0].id : null
  description = "The ID of the dead-letter subscription"
}

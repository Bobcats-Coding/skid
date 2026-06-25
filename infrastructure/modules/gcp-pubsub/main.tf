locals {
  subscription_name      = var.subscription_name != "" ? var.subscription_name : "${var.topic_name}-sub"
  dead_letter_topic_name = var.dead_letter_topic_name != "" ? var.dead_letter_topic_name : "${var.topic_name}-dlq"
}

resource "google_pubsub_topic" "topic" {
  name    = var.topic_name
  project = var.project

  message_retention_duration = var.message_retention_duration

  labels = merge({
    "managed-by" = "terraform"
  }, var.labels)
}

resource "google_pubsub_topic" "dead_letter" {
  count   = var.enable_dead_letter ? 1 : 0
  name    = local.dead_letter_topic_name
  project = var.project

  labels = merge({
    "managed-by" = "terraform"
    "purpose"    = "dead-letter"
  }, var.labels)
}

resource "google_pubsub_subscription" "subscription" {
  count   = var.create_subscription ? 1 : 0
  name    = local.subscription_name
  topic   = google_pubsub_topic.topic.id
  project = var.project

  ack_deadline_seconds       = var.ack_deadline_seconds
  message_retention_duration = var.subscription_message_retention_duration
  enable_exactly_once_delivery = var.enable_exactly_once_delivery

  retry_policy {
    minimum_backoff = var.retry_minimum_backoff
    maximum_backoff = var.retry_maximum_backoff
  }

  dynamic "dead_letter_policy" {
    for_each = var.enable_dead_letter ? [1] : []
    content {
      dead_letter_topic     = google_pubsub_topic.dead_letter[0].id
      max_delivery_attempts = var.max_delivery_attempts
    }
  }

  labels = merge({
    "managed-by" = "terraform"
  }, var.labels)
}

resource "google_pubsub_subscription" "dead_letter_subscription" {
  count   = var.enable_dead_letter ? 1 : 0
  name    = "${local.dead_letter_topic_name}-sub"
  topic   = google_pubsub_topic.dead_letter[0].id
  project = var.project

  ack_deadline_seconds       = var.ack_deadline_seconds
  message_retention_duration = var.subscription_message_retention_duration

  labels = merge({
    "managed-by" = "terraform"
    "purpose"    = "dead-letter"
  }, var.labels)
}

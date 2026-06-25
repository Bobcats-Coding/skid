variable "project" {
  type        = string
  description = "GCP project ID"
}

variable "topic_name" {
  type        = string
  description = "Name of the Pub/Sub topic"
}

variable "labels" {
  type        = map(string)
  default     = {}
  description = "Labels to apply to the topic and subscription"
}

variable "message_retention_duration" {
  type        = string
  default     = "604800s"
  description = "How long to retain unacknowledged messages (default 7 days)"
}

variable "create_subscription" {
  type        = bool
  default     = true
  description = "Whether to create a pull subscription for the topic"
}

variable "subscription_name" {
  type        = string
  default     = ""
  description = "Name of the subscription; defaults to {topic_name}-sub if empty"
}

variable "ack_deadline_seconds" {
  type        = number
  default     = 60
  description = "Acknowledgement deadline in seconds"
}

variable "subscription_message_retention_duration" {
  type        = string
  default     = "604800s"
  description = "How long to retain acknowledged messages in the subscription (default 7 days)"
}

variable "enable_exactly_once_delivery" {
  type        = bool
  default     = false
  description = "Enable exactly-once delivery semantics"
}

variable "enable_dead_letter" {
  type        = bool
  default     = false
  description = "Whether to enable dead-letter topic"
}

variable "dead_letter_topic_name" {
  type        = string
  default     = ""
  description = "Name of the dead-letter topic; defaults to {topic_name}-dlq if empty"
}

variable "max_delivery_attempts" {
  type        = number
  default     = 5
  description = "Maximum number of delivery attempts before sending to dead-letter topic"
}

variable "retry_minimum_backoff" {
  type        = string
  default     = "10s"
  description = "Minimum backoff duration for retry"
}

variable "retry_maximum_backoff" {
  type        = string
  default     = "600s"
  description = "Maximum backoff duration for retry"
}

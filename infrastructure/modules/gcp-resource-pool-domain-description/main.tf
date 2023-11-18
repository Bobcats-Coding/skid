locals {
  resource-pool-object-content = {
    "domain" = var.domain
    "top-domain" = var.top-domain
    "sub-domain" = var.sub-domain
    "managed-zone" = var.parent-managed-zone
  }
  load-balancer-rendered-json = jsonencode(local.resource-pool-object-content)
}

resource "google_storage_bucket_object" "resrource-pool" {
  name   = "${terraform.workspace}-domain-${var.name}.json"
  bucket = var.resource-pool
  content = local.load-balancer-rendered-json
  provider = google.product
}

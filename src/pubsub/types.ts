/* pubsub types */

export type PubSubConfig = {
  projectId?: string
}

export type PublishOptions = {
  orderingKey?: string
  attributes?: Record<string, string>
}

export type PublishResult = {
  messageId: string
}

export type PubSubClient = {
  publish: (
    topicName: string,
    data: Record<string, unknown> | string,
    options?: PublishOptions,
  ) => Promise<PublishResult>

  publishBatch: (
    topicName: string,
    messages: Array<{ data: Record<string, unknown> | string; options?: PublishOptions }>,
  ) => Promise<PublishResult[]>
}

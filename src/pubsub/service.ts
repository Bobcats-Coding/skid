import type { PublishOptions, PublishResult, PubSubClient, PubSubConfig } from './types'

import { PubSub } from '@google-cloud/pubsub'

export const createPubSubClient = (config?: PubSubConfig): PubSubClient => {
  const pubsub = new PubSub(
    config?.projectId !== undefined ? { projectId: config.projectId } : undefined,
  )

  const serializeData = (data: Record<string, unknown> | string): Buffer => {
    if (typeof data === 'string') {
      return Buffer.from(data)
    }
    return Buffer.from(JSON.stringify(data))
  }

  const buildMessageOptions = (
    data: Buffer,
    options?: PublishOptions,
  ): { data: Buffer; orderingKey?: string; attributes?: Record<string, string> } => {
    const messageOptions: {
      data: Buffer
      orderingKey?: string
      attributes?: Record<string, string>
    } = { data }
    if (options?.orderingKey !== undefined) {
      messageOptions.orderingKey = options.orderingKey
    }
    if (options?.attributes !== undefined) {
      messageOptions.attributes = options.attributes
    }
    return messageOptions
  }

  return {
    async publish(
      topicName: string,
      data: Record<string, unknown> | string,
      options?: PublishOptions,
    ): Promise<PublishResult> {
      const topic = pubsub.topic(topicName)
      const messageBuffer = serializeData(data)
      const messageOptions = buildMessageOptions(messageBuffer, options)

      const messageId = await topic.publishMessage(messageOptions)

      return { messageId }
    },

    async publishBatch(
      topicName: string,
      messages: Array<{ data: Record<string, unknown> | string; options?: PublishOptions }>,
    ): Promise<PublishResult[]> {
      const topic = pubsub.topic(topicName)

      const publishPromises = messages.map(async (msg) => {
        const messageBuffer = serializeData(msg.data)
        const messageOptions = buildMessageOptions(messageBuffer, msg.options)
        const messageId = await topic.publishMessage(messageOptions)
        return { messageId }
      })

      return await Promise.all(publishPromises)
    },
  }
}

import {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  CreateImageRequest,
  ImagesResponse,
  ListModelsResponse,
} from '.'

import { OpenAIApi } from 'openai'

class FakeOpenAIApiClient {
  public async listModels(): Promise<{ data: ListModelsResponse }> {
    return {
      data: {
        object: 'list',
        data: [
          {
            id: 'text-davinci-003',
            object: 'model',
            owned_by: 'openai',
            created: 1651172505,
          },
        ],
      },
    }
  }

  public async createChatCompletion(
    createChatCompletionRequest: CreateChatCompletionRequest,
  ): Promise<{ data: CreateChatCompletionResponse }> {
    const { model } = createChatCompletionRequest
    return {
      data: {
        id: 'cmpl-123',
        object: 'chat.completion',
        created: 123,
        model,
        choices: [
          {
            index: 0,
            message: {
              role: 'assistant',
              content: '\n\nHello there, how may I assist you today?',
            },
            finish_reason: 'stop',
          },
        ],
        usage: { prompt_tokens: 23, completion_tokens: 179, total_tokens: 202 },
      },
    }
  }

  public async createImage(
    // @ts-expect-error
    createImageRequest: CreateImageRequest,
  ): Promise<{ data: ImagesResponse }> {
    return {
      data: {
        created: 123,
        data: [{ url: 'https://cdn.openai.com/image.png' }],
      },
    }
  }
}

export const createFakeOpenAIApiClient = (): OpenAIApi => {
  return new FakeOpenAIApiClient() as unknown as OpenAIApi
}

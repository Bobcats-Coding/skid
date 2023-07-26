import {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  ListModelsResponse,
  OpenAIApi,
} from './type'

export type OpenAIApiService = {
  listModels: () => Promise<ListModelsResponse>
  createChatCompletion: (
    params: CreateChatCompletionRequest,
  ) => Promise<CreateChatCompletionResponse>
}

export const createOpenAIAPIFeatureService = (openAIApiClient: OpenAIApi): OpenAIApiService => {
  const handleError = (error: Error): never => {
    throw new Error(`OpenAI API error: ${error.message}`)
  }

  const listModels = async (): Promise<ListModelsResponse> => {
    try {
      const response = await openAIApiClient.listModels()
      return response.data
    } catch (error) {
      return handleError(error as Error)
    }
  }

  const createChatCompletion = async (
    params: CreateChatCompletionRequest,
  ): Promise<CreateChatCompletionResponse> => {
    try {
      const response = await openAIApiClient.createChatCompletion(params)
      return response.data
    } catch (error) {
      return handleError(error as Error)
    }
  }

  return {
    listModels,
    createChatCompletion,
  }
}

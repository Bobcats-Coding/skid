import {
  CreateChatCompletionRequest,
  CreateChatCompletionResponse,
  ListModelsResponse,
  OpenAIApi,
} from './type'

export type OpenAIApiService = {
  listModels: () => Promise<ListModelsResponse>
  createChatCompilation: (
    params: CreateChatCompletionRequest,
  ) => Promise<CreateChatCompletionResponse>
}

export const createOpenAIAPIFeatureService = (openAIApiClient: OpenAIApi): OpenAIApiService => {
  const handleError = (error: any): never => {
    throw new Error(`OpenAI API error: ${JSON.stringify(error)}`)
  }

  const listModels = async (): Promise<ListModelsResponse> => {
    try {
      const response = await openAIApiClient.listModels()
      return response.data
    } catch (error) {
      return handleError(error)
    }
  }

  const createChatCompilation = async (
    params: CreateChatCompletionRequest,
  ): Promise<CreateChatCompletionResponse> => {
    try {
      const response = await openAIApiClient.createChatCompletion(params)
      return response.data
    } catch (error) {
      return handleError(error)
    }
  }

  return {
    listModels,
    createChatCompilation,
  }
}

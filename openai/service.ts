import { createOpenAIApiClient } from './api'
import { createOpenAIAPIFeatureService } from './feature-service'
import type { OpenAIApiService } from './feature-service'

export const createOpenAIApiService = (apiKey: string): OpenAIApiService => {
  const openAIApiClient = createOpenAIApiClient(apiKey)
  return createOpenAIAPIFeatureService(openAIApiClient)
}

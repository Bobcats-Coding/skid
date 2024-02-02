import { Configuration, OpenAIApi } from 'openai'

export const createOpenAIApiClient = (apiKey: string | undefined): OpenAIApi => {
  if (apiKey === undefined) {
    throw new Error('apiKey is undefined')
  }
  const configuration = new Configuration({ apiKey })
  return new OpenAIApi(configuration)
}

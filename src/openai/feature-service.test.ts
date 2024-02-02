import { createFakeOpenAIApiClient } from './fake'
import { createOpenAIAPIFeatureService } from './feature-service'

test('it should create a new feature service using a fake client', async () => {
  const featureService = createOpenAIAPIFeatureService(createFakeOpenAIApiClient())
  expect(featureService.listModels).toBeDefined()
  expect(featureService.createChatCompletion).toBeDefined()
})

test('it should reject if the client rejects', async () => {
  const errorMessage = 'Unexpected error'
  const client = createFakeOpenAIApiClient()
  jest.spyOn(client, 'createChatCompletion').mockRejectedValue(new Error(errorMessage))
  const featureService = createOpenAIAPIFeatureService(client)
  try {
    await featureService.createChatCompletion({} as any)
  } catch (e: any) {
    expect(e.message).toBe(`OpenAI API error: ${errorMessage}`)
  }
})

test('it should list available models', async () => {
  const client = createFakeOpenAIApiClient()
  const featureService = createOpenAIAPIFeatureService(client)
  const res = await featureService.listModels()
  expect(res.data.length).toBe(1)
  expect(res.data[0]?.id).toBe('text-davinci-003')
})

test('it should create a chat completion', async () => {
  const featureService = createOpenAIAPIFeatureService(createFakeOpenAIApiClient())
  const completion = await featureService.createChatCompletion({
    model: 'text-davinci-003',
    messages: [{ role: 'user', content: 'Hello' }],
  })
  expect(completion.object).toBe('chat.completion')
  expect(completion.model).toBe('text-davinci-003')
})

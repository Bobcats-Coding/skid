import { type YargsDelivery } from './get-delivery.ts'

export const main = async ({ delivery }: { delivery: YargsDelivery }): Promise<void> => {
  await delivery.yargsApp.parseAsync(process.argv.slice(2))
  process.exit(0)
}

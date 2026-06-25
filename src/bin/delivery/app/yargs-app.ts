import { type InternalServices } from '../internal-services/type.ts'
import { publishLibYargsModule } from '../publish-lib/yargs-module.ts'

import yargs from 'yargs'

export type YargsApp = yargs.Argv

export const createYargsApp = (services: InternalServices): YargsApp =>
  yargs()
    .scriptName('skid')
    .command(publishLibYargsModule(services))
    .demandCommand(1, 'You need at least one command before moving on')
    .strict()
    .version(false)

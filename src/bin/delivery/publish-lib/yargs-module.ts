import { type SkidBinInternalServices } from '../internal-services/type.ts'

import { type CommandModule } from '@skid-lib/cli/type.ts'

export const publishLibYargsModule = (_: SkidBinInternalServices): CommandModule<PublishLibArgs> => {
  return {
    command: 'publish-lib [lib-path]',
    describe: 'Publish a library',
    builder: (yargs) =>
      yargs
        .positional('lib-path', {
          type: 'string',
        })
        .default('migrate-type', '.'),
    handler: async (args) => {
      console.log(args)
    },
  }
}


type PublishLibArgs = {
  libPath: string,
}

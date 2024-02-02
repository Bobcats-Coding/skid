import { type Runner } from '@bobcats-coding/skid/test/type'

import type { ViteDevServer } from 'vite'
import { createServer } from 'vite'

export type DevServerRunnerConfig = {
  rootDir: string
  port: number
}

export const devServerRunner = (config: DevServerRunnerConfig): Runner => {
  let viteServer: ViteDevServer

  return {
    start: async () => {
      viteServer = await createServer({
        root: config.rootDir,
        server: {
          port: config.port,
        },
        logLevel: 'error',
      })
      await viteServer.listen()
    },
    stop: async () => {
      await viteServer.close()
    },
  }
}

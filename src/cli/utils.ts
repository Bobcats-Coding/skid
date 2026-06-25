import { type StdioMessage } from './type'

import { EOL } from 'node:os'
import { lastValueFrom, map, type Observable } from 'rxjs'

export const printStido = async (stdio$: Observable<StdioMessage>): Promise<void> => {
  await lastValueFrom(
    stdio$.pipe(
      map(({ message, type }) => {
        if (type === 'stderr') {
          process.stderr.write(`${message}${EOL}`)
          return
        }
        process.stdout.write(`${message}${EOL}`)
      }),
    ),
  )
}

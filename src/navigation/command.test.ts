import { navigationCommand } from './command'
import { createAppStore } from './fake'

import { coreMarbles } from '@bobcats-coding/skid/core/marbles'

test(
  'app navigation',
  coreMarbles(({ expect }) => {
    const { store, sliceState$ } = createAppStore()
    const command = navigationCommand(store)
    command.appNavigation({
      pathname: '/',
      search: 'a=1&b=1',
      hash: 'some',
    })
    expect(sliceState$).toBeObservable('n', {
      n: {
        pathname: '/',
        search: 'a=1&b=1',
        hash: 'some',
      },
    })
  }),
)

import type { CommandResult, ExecContext } from '@bobcats-coding/skid/test/interactors/node-command-line.ts'
import { Given, Then, When } from '../support/test-environment.ts'


Given('the Skid Binary is published', async function (world) {
  const npmPublisher = world.get('skidNpmPublisher')
  await publishSkidBinary(npmPublisher.execWithAssertions)
})

When('the user installs the Skid Binary', async function (world) {
  const nodeCommandLine = world.get('nodeCommandLine')
  console.log(await nodeCommandLine.execWithAssertions('npm install -g @skid-lib/bin --registry http://npmregistry:4873'))
})

Then('the user should be able to run skid', async function (world) {
  const nodeCommandLine = world.get('nodeCommandLine')
  console.log(await nodeCommandLine.execWithAssertions('skid --help'))
})

const publishSkidBinary = async (npmPublisherExec: (command: string, context?: Partial<ExecContext>) => Promise<CommandResult>) => {
  await authenticateNpmRegistry(npmPublisherExec)
  await npmPublisherExec('npm publish --registry http://npmregistry:4873', {
    workingDir: '/opt/app/bin/',
  })
}

const authenticateNpmRegistry = async (npmPublisherExec: (command: string) => Promise<CommandResult>) => {
  const response = await fetch('http://localhost:4873/-/user/org.couchdb.user:test', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ name: 'test', password: 'test' })
  })
  const data = await response.json()
  await npmPublisherExec(`echo "//npmregistry:4873/:_authToken=${data.token}" > /root/.npmrc`)
  await npmPublisherExec('cat ~/.npmrc')
}
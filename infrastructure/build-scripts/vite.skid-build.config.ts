import { buildLibrary } from './lib-publish/build.ts'

await buildLibrary({
    srcDir: '/Users/eggdice/Projects/monorepo/skid/src/core',
    outDir: '/Users/eggdice/Projects/monorepo/skid/dist',
    parentPackageJsonDir: '/Users/eggdice/Projects/monorepo/skid/src',
  })

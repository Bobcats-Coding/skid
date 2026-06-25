import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { build } from 'vite'
import { Volume } from 'memfs'
import { patchFs, unpatchFs } from 'fs-monkey'

describe('Vite build in memory using memfs', () => {
  let volume: Volume

  beforeAll(() => {
    volume = Volume.fromJSON(
      {
        '/src/index.ts': `
          export function greet(name: string) {
            return \`Hello, \${name}\`;
          }
        `,
        '/tsconfig.json': JSON.stringify({
          compilerOptions: {
            module: 'ESNext',
            target: 'ESNext',
            strict: true,
            outDir: 'dist'
          }
        }),
        '/index.html': `
          <!DOCTYPE html>
          <html>
            <body><h1>Test</h1></body>
          </html>
        `
      },
      '/'
    )
    patchFs(volume)
    process.chdir('/')
  })

  afterAll(() => {
    unpatchFs()
  })

  it('should build a library from an in-memory TS file', async () => {
    await build({
      root: '/',
      resolve: {
        // So Vite doesn't try to realpath() everything
        preserveSymlinks: true
      },
      build: {
        rollupOptions: {
          preserveSymlinks: true
        },
        lib: {
          // Use relative path (no leading slash)
          entry: 'src/index.ts',
          name: 'MyLib',
          fileName: 'my-lib',
          formats: ['es']
        },
        outDir: 'dist'
      }
    })

    const builtOutput = volume.readFileSync('/dist/my-lib.js', 'utf-8')
    expect(builtOutput).toContain('function greet')
  })
})

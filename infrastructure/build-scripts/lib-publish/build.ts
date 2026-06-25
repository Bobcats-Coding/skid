import { build } from 'vite'
import { globSync } from 'glob'
import { resolve, join, dirname } from 'path'
import dts from 'vite-plugin-dts'
import { builtinModules } from 'module'
import { readFileSync, copyFileSync, mkdirSync, writeFileSync } from 'fs'

export type BuildLibraryArgs = {
  srcDir: string
  outDir: string
  parentPackageJsonDir?: string
}

export const buildLibrary = async ({ srcDir, outDir, parentPackageJsonDir: parentPackageJson }: BuildLibraryArgs) => {
  const packageJson = getPackageJson({ srcDir })
  const external = getExternal({ packageJson })
  const ignore = getIgnore({ srcDir })
  const sourceFiles = globSync(`${srcDir}/**/*.ts`, { ignore })

  writeOriginalFiles({ srcDir, outDir, sourceFiles })
  savePackageJson({ outDir, srcDir, packageJson, sourceFiles, parentPackageJson })

  const entry = getEntry({ srcDir, sourceFiles })

  await build({
    build: {
      sourcemap: true,
      target: 'esnext',
      outDir,
      lib: {
        entry,
        formats: ['es', 'cjs']
      },
      rollupOptions: {
        input: entry,
        external,
        output: [
          {
            format: 'es',
            preserveModules: true,
            entryFileNames: '[name].mjs',
            dir: outDir,
            sourcemapPathTransform,
          },
          {
            format: 'cjs',
            preserveModules: true,
            entryFileNames: '[name].cjs',
            dir: outDir,
            sourcemapPathTransform,
          }
        ]
      }
    },
    plugins: [
      dts({
        exclude: ignore,
        outDir,
        rollupTypes: false,
        copyDtsFiles: false,
        include: sourceFiles,
      })
    ]
  })
}

type GetPackageJsonArgs = {
  srcDir: string
}

const getPackageJson = ({ srcDir }: GetPackageJsonArgs): Record<string, any> => {
  return JSON.parse(readFileSync(join(srcDir, 'package.json'), 'utf-8'))
}

type GetExternalArgs = {
  packageJson: Record<string, any>
}

const getExternal = ({ packageJson }: GetExternalArgs): (string | RegExp)[] => {
  return [
    ...Object.keys(packageJson['dependencies'] ?? {}),
    ...Object.keys(packageJson['peerDependencies'] ?? {}),
    ...builtinModules,
    ...builtinModules.map(mod => `node:${mod}`),
    /node_modules/,
  ]
}

type GetIgnoreArgs = {
  srcDir: string
}

const getIgnore = ({ srcDir }: GetIgnoreArgs): string[] => {
  return [
    '**/node_modules/**',
    '**/*.test.*',
    '**/*.spec.*',
    '**/test/**',
    '**/tests/**',
    '**/__tests__/**'
  ].map(pattern => `${srcDir}/${pattern}`)
}

type WriteOriginalFilesArgs = {
  srcDir: string
  outDir: string
  sourceFiles: string[]
}

const writeOriginalFiles = ({ srcDir, outDir, sourceFiles }: WriteOriginalFilesArgs) => {
  sourceFiles.forEach(file => {
    const relativePath = file.slice(srcDir.length + 1)
    const targetPath = join(outDir, relativePath)
    mkdirSync(dirname(targetPath), { recursive: true })
    copyFileSync(file, targetPath)
  })
}

type SavePackageJsonArgs = {
  outDir: string
  srcDir: string
  packageJson: Record<string, any>
  sourceFiles: string[]
  parentPackageJson?: string | undefined
}

const savePackageJson = ({ outDir, srcDir, packageJson, sourceFiles, parentPackageJson }: SavePackageJsonArgs) => {
  const exports = getExports({ srcDir, sourceFiles })
  const parentPackage = parentPackageJson ? getPackageJson({ srcDir: parentPackageJson }) : {}
  const keysToInherit = ['version', 'description', 'engines', 'license', 'author']
  const inherited = Object.fromEntries(
    keysToInherit.map(key => [key, parentPackage[key]])
  )
  const updatedPkg = {
    ...packageJson,
    exports,
    ...inherited,
  }
  writeFileSync(join(outDir, 'package.json'), JSON.stringify(updatedPkg, null, 2))
}

type GetExportsArgs = {
  srcDir: string
  sourceFiles: string[]
}

const getExports = ({ srcDir, sourceFiles }: GetExportsArgs) => {
  return Object.fromEntries(
    sourceFiles.flatMap(file => {
      const relativePath = file.slice(srcDir.length + 1)
      const entryName = relativePath.slice(0, -3)
      
      return [
        [
          `./${entryName}`,
          {
            import: `./${entryName}.mjs`,
            require: `./${entryName}.cjs`, 
            types: `./${entryName}.d.ts`
          }
        ],
        [
          `./${relativePath}`,
          `./${relativePath}`
        ]
      ]
    })
  ) 
}

type GetEntryArgs = {
  srcDir: string
  sourceFiles: string[]
}

const getEntry = ({ srcDir, sourceFiles }: GetEntryArgs) => {
  return Object.fromEntries(
    sourceFiles.map(file => {
      const entryName = file.slice(srcDir.length + 1, -3)
      const entryPath = resolve(process.cwd(), file)
      return [entryName, entryPath]
    })
  )
}

const sourcemapPathTransform = (relativeSourcePath: string) => {
  return relativeSourcePath.split('/src/')[1] ?? ''
}
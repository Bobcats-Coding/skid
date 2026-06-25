# Skid

Shared library (`@bobcats-coding/skid`) providing reusable tools and services for all projects in
the monorepo. Published to NPM. Version 0.9.8.

## Import Pattern

```typescript
import { createJwtService } from '@bobcats-coding/skid/jwt'
import { createDatasource } from '@bobcats-coding/skid/datasource'
import type { Nullable } from '@bobcats-coding/skid/core'
```

## Module Catalog

| Module             | Purpose                                            | Key Export                             |
| ------------------ | -------------------------------------------------- | -------------------------------------- |
| `core`             | Application framework, state store, RxJS utilities | `createApplication`, `createCoreStore` |
| `datasource`       | PostgreSQL + Kysely DB connections, migrations     | `createDatasource`, `createMigrator`   |
| `jwt`              | JWT token creation/verification (jose)             | `createJwtService`                     |
| `crypto`           | Password hashing (bcrypt)                          | `createCryptoService`                  |
| `email`            | Email sending (SendGrid)                           | `createSender`                         |
| `sms`              | SMS sending (Twilio)                               | `createSender`                         |
| `feature-flipper`  | Feature flag management                            | `createFeatureFlipperService`          |
| `key-value-stores` | Type-safe KV stores with Zod validation            | `createKeyValueStore`                  |
| `navigation`       | Client-side routing (universal-router)             | `createRouter`                         |
| `rest`             | Observable-based REST client                       | `createRestClientCreator`              |
| `process`          | Subprocess execution with RxJS                     | `createProcessService`                 |
| `gcs-bucket`       | Google Cloud Storage operations                    | `createGcsClient`                      |
| `pubsub`           | Google Pub/Sub messaging                           | `createPubSubClient`                   |
| `rooam-api`        | Rooam POS integration                              | Menu/order operations                  |
| `omnivore-api`     | Omnivore POS integration                           | Ticket/payment operations              |
| `make-com-api`     | Make.com workflow automation                       | Webhook triggers                       |
| `google-drive`     | Google Drive file operations                       | File read/write                        |
| `google-forms-api` | Google Forms data access                           | Form responses                         |
| `test`             | BDD test environment (Cucumber/Playwright)         | `createTestEnvironment`                |
| `qwik`             | Qwik.js framework integration                      | `createQwikHooks`                      |
| `build-tools`      | Vite plugins for internal services                 | Vite plugin                            |
| `cli`              | Command-line utilities                             | CLI helpers                            |
| `event`            | Event emitter patterns                             | Event types                            |
| `random`           | Crypto-secure random generation                    | `createRandomService`                  |
| `router`           | Route utilities                                    | Route helpers                          |

## Key Patterns

### Factory Functions

All services follow `createXxxService(config)` pattern returning a typed service object:

```typescript
export const createCryptoService: CryptoServiceCreator = (backend) => ({
  encryptPassword: (password) => backend.hash(password),
  comparePassword: (password, hash) => backend.compare(password, hash),
})
```

### RxJS Observable-First

Async operations return `Observable`. Common patterns: `from()` for Promise wrapping, `pipe()` with
`mergeMap`, `map`, `combineLatest`, `startWith`, `scan`.

### Fake Implementations for Testing

Every service has a corresponding `fake.ts` with `createXxxFake()` or `createXxxStub()` for testing:

```typescript
// In service/fake.ts
export const createFakeCryptoService = (): CryptoService => ({
  encryptPassword: (pw) => of(`hashed_${pw}`),
  comparePassword: (pw, hash) => of(hash === `hashed_${pw}`),
})
```

### Advanced TypeScript Generics

Heavy use of `const` type parameters and conditional types for maximum type safety:

```typescript
export const createFeatureFlipperService = <
  const CONFIG extends readonly FeatureFlipperConfiguration[]
>(config: CONFIG): FeatureFlipperService<CONFIG> => { ... }
```

## Module Structure Convention

Each module follows this file layout:

- `service.ts` — Implementation (factory function)
- `types.ts` — Type definitions (service interface, config, dependencies)
- `fake.ts` — Test implementation
- `index.ts` — Re-exports public API

## TypeScript Config

Base config at `skid/src/tsconfig.base.json` — very strict:

- `exactOptionalPropertyTypes: true`
- `noUncheckedIndexedAccess: true`
- `noUnusedLocals: true`, `noUnusedParameters: true`
- `useUnknownInCatchVariables: true`
- `noPropertyAccessFromIndexSignature: true`
- Target: `esnext`, Module: `ES2022`

All bars project tsconfigs extend this base.

## Adding a New Module

1. Create folder in `skid/src/<module-name>/`
2. Add `types.ts` with service interface and config types
3. Add `service.ts` with `create<Name>Service()` factory function
4. Add `fake.ts` with `create<Name>Fake()` for testing
5. Add `index.ts` re-exporting public API
6. Add `service.test.ts` with unit tests
7. Export path is automatically available as `@bobcats-coding/skid/<module-name>`

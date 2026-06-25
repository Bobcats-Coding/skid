export type QwikAppIdentity = {
  entryPoint: 'dev' | 'preview' | 'server' | 'ssr' | 'frontend'
  environment: 'prod' | 'test'
}

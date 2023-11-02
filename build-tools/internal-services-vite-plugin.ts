import { type Plugin } from 'vite'

type QwikInternalServicesConfig = {
  applications: Record<string, string>
}

export const qwikInternalServices = (config: QwikInternalServicesConfig): Plugin => {
  console.log(config)
  return {
    name: 'qwik-internal-services',
    resolveId(id) {
      if (id === '@skid-qwik-internal-services/app-prod') {
        return id
      }
      return undefined
    },
    load(id) {
      if (id === '@skid-qwik-internal-services/app-prod') {
        const application = config.applications['@skid-qwik-internal-services/app-prod']
        return `export { application } from '${application}'`
      }
      return undefined
    },
  }
}

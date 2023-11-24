import {
  camelCase2kebabCase,
  kebabCase2camelCase,
  toCamelCase,
} from '@bobcats-coding/skid/core/util'

type DomainFileTerraform = {
  name: string
  content: {
    domain: string
    'top-domain': string
    'sub-domain': string
    'manged-zone': string
  }
}

type ServiceFile = {
  name: string
  content: {
    domain: string
    path: string
    service: string
  }
}

type DomainFile = {
  name: string
  content: {
    domain: string
    topDomain: string
    subDomain: string
    mangedZone: string
  }
}

type GetResourcePoolServicesAndDomainsArgs = {
  serviceFiles: ServiceFile[]
  domainFiles: DomainFile[]
}

type GetResourcePoolServicesAndDomainsOutput = {
  services: Record<
    string,
    {
      domain: string
      path: string
      service: string
      domainKey: string
    }
  >
  domains: Record<
    string,
    {
      domain: string
      topDomain: string
      subDomain: string
      mangedZone: string
    }
  >
}

type ResourcePoolInput = {
  services: Record<
    string,
    {
      domain: string
      path: string
      service: string
      'domain-key': string
    }
  >
  domains: Record<
    string,
    {
      domain: string
      'top-domain': string
      'sub-domain': string
      'manged-zone': string
    }
  >
}

export const getResourcePoolServicesAndDomains = ({
  serviceFiles,
  domainFiles,
}: GetResourcePoolServicesAndDomainsArgs): GetResourcePoolServicesAndDomainsOutput => {
  const domains = domainFiles.reduce<GetResourcePoolServicesAndDomainsOutput['domains']>(
    (acc, { content }) => {
      const domainKey = toCamelCase(content.domain.split('.'))
      acc[domainKey] = {
        ...content,
      }
      return acc
    },
    {},
  )

  const services = serviceFiles.reduce<GetResourcePoolServicesAndDomainsOutput['services']>(
    (acc, { name, content }) => {
      const domainKey =
        Object.entries(domains).find(([, { domain }]) => {
          return content.domain.endsWith(domain)
        })?.[0] ?? ''
      acc[name] = {
        ...content,
        domainKey,
      }
      return acc
    },
    {},
  )

  return {
    services,
    domains,
  }
}

export const terraformDomainFileToTS = (file: DomainFileTerraform): DomainFile => {
  const entries = Object.entries(file.content).map(([key, value]) => {
    return [kebabCase2camelCase(key), value]
  })
  return {
    ...file,
    content: Object.fromEntries(entries),
  }
}

export const toResourcePoolInput = ({
  services,
  domains,
}: GetResourcePoolServicesAndDomainsOutput): ResourcePoolInput => {
  return {
    services: Object.fromEntries(
      Object.entries(services).map(([key, value]) => {
        return [key, tsServiceToTerraform(value)]
      }),
    ),
    domains: Object.fromEntries(
      Object.entries(domains).map(([key, value]) => {
        return [camelCase2kebabCase(key), tsDomainToTerraform(value)]
      }),
    ),
  }
}

const tsServiceToTerraform = (
  service: GetResourcePoolServicesAndDomainsOutput['services'][string],
): ResourcePoolInput['services'][string] => {
  return Object.fromEntries(
    Object.entries(service).map(([key, value]) => {
      if (key === 'domainKey') {
        return ['domain-key', camelCase2kebabCase(value)]
      }
      return [camelCase2kebabCase(key), value]
    }),
  ) as ResourcePoolInput['services'][string]
}

export const tsDomainToTerraform = (
  domain: GetResourcePoolServicesAndDomainsOutput['domains'][string],
): ResourcePoolInput['domains'][string] => {
  return Object.fromEntries(
    Object.entries(domain).map(([key, value]) => {
      return [camelCase2kebabCase(key), value]
    }),
  ) as ResourcePoolInput['domains'][string]
}

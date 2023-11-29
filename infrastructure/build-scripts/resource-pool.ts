import {
  camelCase2kebabCase,
  kebabCase2camelCase,
  toCamelCase,
} from '@bobcats-coding/skid/core/util'
import { z } from 'zod'

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

const serviceSchema = z.object({
  domain: z.string().nonempty(),
  path: z.string().nonempty(),
  service: z.string().nonempty(),
  domainKey: z.string().nonempty(),
})

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

  const services = serviceFiles
    .map(({name, content}) => {
      const domainKey =
        Object.entries(domains).find(([, { domain }]) => {
          return content.domain.endsWith(domain)
        })?.[0] ?? ''
      return {
        name,
        content: {
          ...content,
          domainKey,
        },
      }
    })
    .filter(({ content }) => {
      const result = serviceSchema.safeParse(content)
      return result.success
    })
    .reduce<GetResourcePoolServicesAndDomainsOutput['services']>(
      (acc, { name, content }) => {
        acc[name] = content
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

type SplitAndParseServiceAndDomainFilesArgs = {
  files: Array<{ name: string; content: string }>
  pullRequests: number[]
}

export const splitAndParseServiceAndDomainFiles = ({
  files,
  pullRequests,
}: SplitAndParseServiceAndDomainFilesArgs): {
  serviceFiles: ServiceFile[]
  domainFiles: DomainFile[]
} => {
  const isDomain = /^pr-\d+-domain-/
  const prFiles = files.filter(({ name }) => {
    return pullRequests.some((pr) => {
      return name.startsWith(`pr-${pr}`)
    })
  })
  const serviceFiles = prFiles.filter(({ name }) => {
    return !isDomain.test(name)
  })
  const domainFiles = prFiles.filter(({ name }) => {
    return isDomain.test(name)
  })
  return {
    serviceFiles: serviceFiles.map((file) => {
      return {
        ...file,
        content: JSON.parse(file.content),
      }
    }),
    domainFiles: domainFiles.map((file) => {
      return {
        ...file,
        content: JSON.parse(file.content),
      }
    }),
  }
}

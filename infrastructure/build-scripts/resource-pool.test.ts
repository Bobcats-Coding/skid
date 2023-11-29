import {
  getResourcePoolServicesAndDomains,
  splitAndParseServiceAndDomainFiles,
  terraformDomainFileToTS,
  toResourcePoolInput,
} from './resource-pool'

test('getResourcePoolServicesAndDomains empty', () => {
  const { services, domains } = getResourcePoolServicesAndDomains({
    serviceFiles: [],
    domainFiles: [],
  })
  expect(services).toEqual({})
  expect(domains).toEqual({})
})

test('getResourcePoolServicesAndDomains', () => {
  const serviceFiles = [
    {
      name: 'test1',
      content: {
        domain: 'pr-1.sub.example.org',
        path: '/*',
        service: 'test1',
      },
    },
    {
      name: 'test2',
      content: {
        domain: 'pr-2.sub.example.org',
        path: '/*',
        service: 'test2',
      },
    },
  ]
  const domainFiles = [
    {
      name: 'test1',
      content: {
        domain: 'sub.example.org',
        topDomain: 'example.org',
        subDomain: 'sub',
        mangedZone: 'example-org',
      },
    },
  ]
  const { services, domains } = getResourcePoolServicesAndDomains({ serviceFiles, domainFiles })
  expect(services).toEqual({
    test1: {
      domain: 'pr-1.sub.example.org',
      path: '/*',
      service: 'test1',
      domainKey: 'subExampleOrg',
    },
    test2: {
      domain: 'pr-2.sub.example.org',
      path: '/*',
      service: 'test2',
      domainKey: 'subExampleOrg',
    },
  })
  expect(domains).toEqual({
    subExampleOrg: {
      domain: 'sub.example.org',
      topDomain: 'example.org',
      subDomain: 'sub',
      mangedZone: 'example-org',
    },
  })
})

test('getResourcePoolServicesAndDomains filter', () => {
  const serviceFiles = [
    {
      name: 'test1',
      content: {
        domain: 'pr-1.sub.example.org',
        path: '/*',
        service: 'test1',
      },
    },
    {
      name: 'test2',
      content: {
        domain: 'pr-2.sub.example2.org',
        path: '/*',
        service: 'test2',
      },
    },
    {
      name: 'test3',
      content: {
        domain: 'pr-1.sub.example.org',
        path: '/*',
        service: '',
      },
    },
    {
      name: 'test4',
      content: {
        domain: '',
        path: '/*',
        service: 'test1',
      },
    },
    {
      name: 'test5',
      content: {
        domain: 'pr-1.sub.example.org',
        path: '',
        service: 'test1',
      },
    },
  ]
  const domainFiles = [
    {
      name: 'test1',
      content: {
        domain: 'sub.example.org',
        topDomain: 'example.org',
        subDomain: 'sub',
        mangedZone: 'example-org',
      },
    },
  ]
  const { services, domains } = getResourcePoolServicesAndDomains({ serviceFiles, domainFiles })
  expect(services).toEqual({
    test1: {
      domain: 'pr-1.sub.example.org',
      path: '/*',
      service: 'test1',
      domainKey: 'subExampleOrg',
    },
  })
  expect(domains).toEqual({
    subExampleOrg: {
      domain: 'sub.example.org',
      topDomain: 'example.org',
      subDomain: 'sub',
      mangedZone: 'example-org',
    },
  })
})



test('terraformDomainFileToTS', () => {
  const domainFile = {
    name: 'test1',
    content: {
      domain: 'sub.example.org',
      'top-domain': 'example.org',
      'sub-domain': 'sub',
      'manged-zone': 'example-org',
    },
  }
  const ts = terraformDomainFileToTS(domainFile)
  expect(ts).toEqual({
    name: 'test1',
    content: {
      domain: 'sub.example.org',
      topDomain: 'example.org',
      subDomain: 'sub',
      mangedZone: 'example-org',
    },
  })
})

test('toResourcePoolInput', () => {
  const tsInput = {
    services: {
      test1: {
        domain: 'pr-1.sub.example.org',
        path: '/*',
        service: 'test1',
        domainKey: 'subExampleOrg',
      },
      test2: {
        domain: 'pr-2.sub.example.org',
        path: '/*',
        service: 'test2',
        domainKey: 'subExampleOrg',
      },
    },
    domains: {
      subExampleOrg: {
        domain: 'sub.example.org',
        topDomain: 'example.org',
        subDomain: 'sub',
        mangedZone: 'example-org',
      },
    },
  }
  const input = toResourcePoolInput(tsInput)
  expect(input).toEqual({
    services: {
      test1: {
        domain: 'pr-1.sub.example.org',
        path: '/*',
        service: 'test1',
        'domain-key': 'sub-example-org',
      },
      test2: {
        domain: 'pr-2.sub.example.org',
        path: '/*',
        service: 'test2',
        'domain-key': 'sub-example-org',
      },
    },
    domains: {
      'sub-example-org': {
        domain: 'sub.example.org',
        'top-domain': 'example.org',
        'sub-domain': 'sub',
        'manged-zone': 'example-org',
      },
    },
  })
})

test('splitAndParseServiceAndDomainFiles', () => {
  const allFiles = [
    {
      name: 'pr-1-test1',
      content: '{"domain":"pr-1.sub.example.org","path":"/*","service":"test1"}',
    },
    {
      name: 'pr-2-test1',
      content: '{"domain":"pr-2.sub.example.org","path":"/*","service":"test1"}',
    },
    {
      name: 'pr-3-test1',
      content: '{"domain":"pr-3.sub.example.org","path":"/*","service":"test1"}',
    },
    {
      name: 'pr-1-domain-test1',
      content:
        '{"domain":"sub.example.org","top-domain":"example.org","sub-domain":"sub","manged-zone":"example-org"}',
    },
    {
      name: 'pr-2-domain-test1',
      content:
        '{"domain":"sub.example.org","top-domain":"example.org","sub-domain":"sub","manged-zone":"example-org"}',
    },
    {
      name: 'pr-3-domain-test1',
      content:
        '{"domain":"sub.example.org","top-domain":"example.org","sub-domain":"sub","manged-zone":"example-org"}',
    },
  ]
  const { serviceFiles, domainFiles } = splitAndParseServiceAndDomainFiles({
    files: allFiles,
    pullRequests: [1, 2],
  })
  expect(serviceFiles).toEqual([
    {
      name: 'pr-1-test1',
      content: {
        domain: 'pr-1.sub.example.org',
        path: '/*',
        service: 'test1',
      },
    },
    {
      name: 'pr-2-test1',
      content: {
        domain: 'pr-2.sub.example.org',
        path: '/*',
        service: 'test1',
      },
    },
  ])
  expect(domainFiles).toEqual([
    {
      name: 'pr-1-domain-test1',
      content: {
        domain: 'sub.example.org',
        'top-domain': 'example.org',
        'sub-domain': 'sub',
        'manged-zone': 'example-org',
      },
    },
    {
      name: 'pr-2-domain-test1',
      content: {
        domain: 'sub.example.org',
        'top-domain': 'example.org',
        'sub-domain': 'sub',
        'manged-zone': 'example-org',
      },
    },
  ])
})

import type { DiageoNamAPIClient } from './api'

import type { Observable } from 'rxjs'

export type InboundSubmissionData = {
  SubscriberKey: string
  EmailAddress: string
  FirstName: string
  LastName: string
  DateOfBirth: string
  PostCode: string
  PhoneNumber: string
  Emailable: boolean
  Country: string
  Province: string
  PrivacyPolicyVersion: string
  Brand: string
  BrandAbbreviation: string
  EntrySource: string
  TDGlobalID: string
  TDSSCID: string
  AdditionalField1: string
  AdditionalValue1: string
  AdditionalField2: string
  AdditionalValue2: string
  AdditionalField3: string
  AdditionalValue3: string
  AdditionalField4: string
  AdditionalValue4: string
  AdditionalField5: string
  AdditionalValue5: string
}

export type InboundSubmissionPayload = {
  ContactKey: string
  EventDefinitionKey: string
  Data: InboundSubmissionData
}

export type InboundSubmissionResult = {
  status: 'success'
  messageId: string | undefined
  raw: unknown
}

export type DiageoNamConfig = {
  clientId: string
  clientSecret: string
}

export type TokenProvider = {
  getToken: () => Observable<string>
  invalidate: () => void
}

export type DiageoNamService = {
  submitInbound: (payload: InboundSubmissionPayload) => Observable<InboundSubmissionResult>
}

export type DiageoNamServiceCreator = (
  apiClient: DiageoNamAPIClient,
  config: DiageoNamConfig,
  options?: { tokenProvider?: TokenProvider },
) => DiageoNamService

export class DiageoNamTransientError extends Error {
  readonly isTransient = true

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'DiageoNamTransientError'
    if (cause !== undefined) {
      ;(this as { cause?: unknown }).cause = cause
    }
  }
}

export class DiageoNamAuthError extends Error {
  readonly isTransient = true

  constructor(message: string, cause?: unknown) {
    super(message)
    this.name = 'DiageoNamAuthError'
    if (cause !== undefined) {
      ;(this as { cause?: unknown }).cause = cause
    }
  }
}

export class DiageoNamPermanentError extends Error {
  readonly httpStatus: number | undefined

  constructor(message: string, httpStatus: number | undefined, cause?: unknown) {
    super(message)
    this.name = 'DiageoNamPermanentError'
    this.httpStatus = httpStatus
    if (cause !== undefined) {
      ;(this as { cause?: unknown }).cause = cause
    }
  }
}

export class DiageoNamWafError extends Error {
  readonly httpStatus = 403
  readonly supportId: string | undefined

  constructor(message: string, supportId: string | undefined, cause?: unknown) {
    super(message)
    this.name = 'DiageoNamWafError'
    this.supportId = supportId
    if (cause !== undefined) {
      ;(this as { cause?: unknown }).cause = cause
    }
  }
}

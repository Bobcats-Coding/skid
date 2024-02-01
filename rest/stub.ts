import type { GetResponseType, RestEndpoint, RestEndpointRequest } from './service'

import deepEqual from 'deep-equal'
import { delay, mergeMap, of, throwError, timer } from 'rxjs'
import type { Observable } from 'rxjs'

export type StubEndpoint<API extends RestEndpoint> =
  API extends RestEndpoint<infer Request, infer Response>
    ? {
        request: Request
        response: Response
        delay?: number
      }
    : never

export const createStubRestClient =
  <API extends RestEndpoint, ENDPOINTS extends ReadonlyArray<StubEndpoint<API>>>(
    endpoints: ENDPOINTS,
  ) =>
  <REQUEST extends RestEndpointRequest>(
    request: REQUEST,
  ): Observable<GetResponseType<API, REQUEST>> => {
    const endpoint = endpoints.find(
      (endpoint: StubEndpoint<RestEndpoint>): endpoint is StubEndpoint<RestEndpoint<REQUEST>> =>
        deepEqual(endpoint.request, request),
    )
    return getFakeValue(endpoint?.response, endpoint?.delay ?? 1)
  }

const getFakeValue = <T>(value: T, delayTime: number): Observable<T> | Observable<never> =>
  value instanceof Error
    ? timer(delayTime).pipe(mergeMap(() => throwError(() => value)))
    : of(value).pipe(delay(delayTime))

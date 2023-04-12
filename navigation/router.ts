import type { Location } from './type'

import type { RouteContext } from 'universal-router/sync'
import UniversalRouterSync from 'universal-router/sync'

type Route = {
  route: string
  id: string
}

export type RouteMatch = {
  pathname: string
  search: URLSearchParams
  hash: string
  params: PathParams
} & Route

export type Router = {
  resolve: (location: Location) => RouteMatch | undefined | never
  match: (location: Location, id: string) => RouteMatch | undefined
}

type PathParams = Record<string, string | string[]>

export const createRouter = (routes: Route[]): Router => {
  const matchRoutes = routes.map((route) => ({
    path: route.route,
    action: (context: RouteContext, params: PathParams) => ({
      id: route.id,
      pathname: context.pathname,
      search: new URLSearchParams(context['search']),
      hash: context['hash'],
      params,
      route: route.route,
    }),
    id: route.id,
  }))
  const universalRouter = new UniversalRouterSync(matchRoutes)
  return {
    resolve: (location) => {
      try {
        return universalRouter.resolve(location) ?? undefined
      } catch (err) {
        throw new Error(`Route not found: "${location.pathname}"`, {
          cause: err as Error,
        })
      }
    },
    match: (location: Location, id: string) => {
      const matchRoute = matchRoutes.filter((route) => route.id === id)
      const matchRouter = new UniversalRouterSync(matchRoute)
      try {
        return matchRouter.resolve(location) ?? undefined
      } catch {
        return undefined
      }
    },
  }
}

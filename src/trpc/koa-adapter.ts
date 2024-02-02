import type { AnyRouter } from '@trpc/server'
import {
  type NodeHTTPCreateContextFnOptions,
  type NodeHTTPHandlerOptions,
  nodeHTTPRequestHandler,
} from '@trpc/server/adapters/node-http'
import type { IncomingMessage, ServerResponse } from 'http'
import type { Middleware } from 'koa'

export type CreateTrpcKoaContextOptions = NodeHTTPCreateContextFnOptions<
  IncomingMessage,
  ServerResponse<IncomingMessage>
>
export type AdditionalMiddlewareOpts = { prefix?: `/${string}` }
export type CreateKoaMiddlewareOptions<TRouter extends AnyRouter> = NodeHTTPHandlerOptions<
  TRouter,
  IncomingMessage,
  ServerResponse<IncomingMessage>
> &
  AdditionalMiddlewareOpts

export const createKoaMiddleware =
  <TRouter extends AnyRouter>(opts: CreateKoaMiddlewareOptions<TRouter>): Middleware =>
  async (ctx, next) => {
    const { prefix } = opts
    const { req, res, request } = ctx

    if (prefix !== undefined && !request.path.startsWith(prefix)) return await next()

    // koa uses 404 as a default status but some logic in
    // nodeHTTPRequestHandler assumes default status of 200.
    // https://github.com/trpc/trpc/blob/abc941152b71ff2d68c63156eb5a142174779261/packages/server/src/adapters/node-http/nodeHTTPRequestHandler.ts#L63
    res.statusCode = 200

    await nodeHTTPRequestHandler({
      ...opts,
      req,
      res,
      path: request.path.slice((prefix?.length ?? 0) + 1),
    })
  }

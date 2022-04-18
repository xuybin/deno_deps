type HandlerContext<T = unknown> = T & {
  /** The local address of the connection. */
  readonly localAddr: Deno.Addr;
  /** The remote address of the connection. */
  readonly remoteAddr: Deno.Addr;
};

export type Handler<T = unknown> = (
  req: Request,
  ctx: HandlerContext<T>,
) => Response | Promise<Response>;

/**
 * A handler type for anytime the `MatchHandler` or `other` parameter handler
 * fails
 */
export type ErrorHandler<T = unknown> = (
  req: Request,
  ctx: HandlerContext<T>,
  err: unknown,
) => Response | Promise<Response>;

/**
 * A handler type for anytime a method is received that is not defined
 */
export type UnknownMethodHandler<T = unknown> = (
  req: Request,
  ctx: HandlerContext<T>,
  knownMethods: string[],
) => Response | Promise<Response>;

/**
 * A handler type for a router path match which gets passed the matched values
 */
export type MatchHandler<T = unknown> = (
  req: Request,
  ctx: HandlerContext<T>,
  match: Record<string, string>,
) => Response | Promise<Response>;

/**
 * A record of route paths and `MatchHandler`s which are called when a match is
 * found along with it's values.
 *
 * The route paths follow the path-to-regexp format with the addition of being able
 * to prefix a route with a method name and the `@` sign. For example a route only
 * accepting `GET` requests would look like: `GET@/`.
 */
// deno-lint-ignore ban-types
export type Routes<T = {}> = Record<string, MatchHandler<T>>;

/**
 * The default other handler for the router
 */
export function defaultOtherHandler(_req: Request): Response {
  return new Response(null, {
    status: 404,
  });
}

/**
 * The default error handler for the router
 */
export function defaultErrorHandler(
  _req: Request,
  _ctx: HandlerContext,
  err: unknown,
): Response {
  console.error(err);

  return new Response(null, {
    status: 500,
  });
}

/**
 * The default unknown method handler for the router
 */
export function defaultUnknownMethodHandler(
  _req: Request,
  _ctx: HandlerContext,
  knownMethods: string[],
): Response {
  return new Response(null, {
    status: 405,
    headers: {
      Accept: knownMethods.join(", "),
    },
  });
}

export const METHODS = [
  "GET",
  "HEAD",
  "POST",
  "PUT",
  "DELETE",
  "OPTIONS",
  "PATCH",
] as const;

const methodRegex = new RegExp(`(?<=^(?:${METHODS.join("|")}))@`);

/**
 * A simple and tiny router for deno
 *
 * ```
 * import { serve } from "https://deno.land/std/http/server.ts";
 * import { router } from "https://crux.land/router@0.0.9";
 *
 * await serve(
 *   router({
 *     "/": (_req) => new Response("Hello world!", { status: 200 }),
 *   }),
 * );
 * ```
 *
 * @param routes A record of all routes and their corresponding handler functions
 * @param other An optional parameter which contains a handler for anything that
 * doesn't match the `routes` parameter
 * @param error An optional parameter which contains a handler for any time it
 * fails to run the default request handling code
 * @param unknownMethod An optional parameter which contains a handler for any time a method
 * that is not defined is used
 * @returns A deno std compatible request handler
 */
export function router<T = unknown>(
  routes: Routes<T>,
  other: Handler<T> = defaultOtherHandler,
  error: ErrorHandler<T> = defaultErrorHandler,
  unknownMethod: UnknownMethodHandler<T> = defaultUnknownMethodHandler,
): Handler<T> {
  const internalRoutes: Record<
    string,
    { pattern: URLPattern; methods: Record<string, MatchHandler<T>> }
  > = {};
  for (const [route, handler] of Object.entries(routes)) {
    let [methodOrPath, path] = route.split(methodRegex);
    let method = methodOrPath;
    if (!path) {
      path = methodOrPath;
      method = "any";
    }
    const r = internalRoutes[path] ?? {
      pattern: new URLPattern({ pathname: path }),
      methods: {},
    };
    r.methods[method] = handler;
    internalRoutes[path] = r;
  }

  return async (req, ctx) => {
    try {
      for (const { pattern, methods } of Object.values(internalRoutes)) {
        const res = pattern.exec(req.url);
        if (res !== null) {
          for (const [method, handler] of Object.entries(methods)) {
            if (req.method === method) {
              return await handler(
                req,
                ctx,
                res.pathname.groups,
              );
            }
          }
          if (methods["any"]) {
            return await methods["any"](
              req,
              ctx,
              res.pathname.groups,
            );
          } else {
            return await unknownMethod(
              req,
              ctx,
              Object.keys(methods),
            );
          }
        }
      }
      return await other(req, ctx);
    } catch (err) {
      return error(req, ctx, err);
    }
  };
}

declare interface URLPatternInit {
  protocol?: string;
  username?: string;
  password?: string;
  hostname?: string;
  port?: string;
  pathname?: string;
  search?: string;
  hash?: string;
  baseURL?: string;
}

declare type URLPatternInput = string | URLPatternInit;
declare interface URLPatternComponentResult {
  input: string;
  groups: Record<string, string>;
}

declare interface URLPatternResult {
  /** The inputs provided when matching. */
  inputs: [URLPatternInit] | [URLPatternInit, string];

  /** The matched result for the `protocol` matcher. */
  protocol: URLPatternComponentResult;
  /** The matched result for the `username` matcher. */
  username: URLPatternComponentResult;
  /** The matched result for the `password` matcher. */
  password: URLPatternComponentResult;
  /** The matched result for the `hostname` matcher. */
  hostname: URLPatternComponentResult;
  /** The matched result for the `port` matcher. */
  port: URLPatternComponentResult;
  /** The matched result for the `pathname` matcher. */
  pathname: URLPatternComponentResult;
  /** The matched result for the `search` matcher. */
  search: URLPatternComponentResult;
  /** The matched result for the `hash` matcher. */
  hash: URLPatternComponentResult;
}

declare class URLPattern {
  constructor(input: URLPatternInput, baseURL?: string);

  test(input: URLPatternInput, baseURL?: string): boolean;

  exec(input: URLPatternInput, baseURL?: string): URLPatternResult | null;
}

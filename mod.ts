import {
  Application,
  bold,
  Context,
  cyan,
  green,
  Router,
  Status,
  verify,
  WebhookEvent,
  WebhookEventMap,
  WebhookEventName,
  yellow,
} from "./deps.ts";

const server = new Application();
const router = new Router();

interface Options {
  /**
   * The webhook secret for sign and verify requests
   */
  readonly secret?: string;
}

function makeWebhookHandler(options?: Options, eventHandlerMap = new Map()) {
  return async (ctx: Context) => {
    const name = ctx.request.headers.get(
      "X-GitHub-Event",
    ) as WebhookEventName;

    ctx.assert(!!name, Status.BadRequest, "Not a github event");

    const body = ctx.request.body({ type: "json" });
    const signature = ctx.request.headers.get("X-Hub-Signature-256");
    const data: WebhookEvent = await body.value;

    if (options?.secret) {
      ctx.assert(!!signature, Status.BadRequest, "No signature present");

      ctx.assert(
        await verify(
          options?.secret,
          JSON.stringify(data),
          signature.slice("sha256=".length),
        ),
        Status.BadRequest,
        "Signature verify fail",
      );
    } else {
      ctx.assert(!signature, Status.NotAcceptable, "No secret provided");
    }

    const handlers = eventHandlerMap.get(name) ?? [];

    for (const h of handlers) {
      h(data, ctx);
    }

    ctx.response.status = Status.OK;
  };
}

// Logger
server.use(async (ctx, next) => {
  await next();
  const rt = ctx.response.headers.get("X-Response-Time");
  console.log(
    `${green(ctx.request.method)} ${cyan(ctx.request.url.pathname)} - ${
      bold(
        String(rt),
      )
    }`,
  );
});

server.use(async (ctx, next) => {
  const start = Date.now();
  await next();
  const ms = Date.now() - start;
  ctx.response.headers.set("X-Response-Time", `${ms}ms`);
});
server.use(router.routes());
server.use(router.allowedMethods());

server.addEventListener("listen", ({ hostname, port, serverType }) => {
  console.log(
    bold("Start listening on ") + yellow(`${hostname}:${port}`),
  );
  console.log(bold("using HTTP server: " + yellow(serverType)));
});

type On = <T extends WebhookEventName>(
  name: T,
  handler: (
    payload: WebhookEventMap[T],
    context: Context,
  ) => void,
) => { on: On };

export const app = (path: string, options?: Options): { on: On } => {
  const map = new Map();
  router.post(path, makeWebhookHandler(options, map));

  const on: On = function (name, handler) {
    const handlers = map.get(name) ?? [];
    handlers.push(handler);
    map.set(name, handlers);

    return { on };
  };

  return { on };
};

setTimeout(() => {
  server.listen({ hostname: "127.0.0.1", port: 8000 });
})

export { makeLarkSender } from "./lark.ts";
export { pullRequest, pullRequestReview } from "./message.ts";

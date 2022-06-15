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

const app = new Application();
const router = new Router();
const eventHandlerMap = new Map();

interface Options {
  /**
   * Path for webhook request, default is "/webhook"
   */
  readonly webhookPath?: string;

  /**
   * The webhook secret for sign and verify requests
   */
  readonly secret?: string;
}

export async function start(options?: Options) {
  router
    .post(options?.webhookPath ?? "/webhook", async (ctx: Context) => {
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
    });

  // Logger
  app.use(async (ctx, next) => {
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

  app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.response.headers.set("X-Response-Time", `${ms}ms`);
  });
  app.use(router.routes());
  app.use(router.allowedMethods());

  app.addEventListener("listen", ({ hostname, port, serverType }) => {
    console.log(
      bold("Start listening on ") + yellow(`${hostname}:${port}`),
    );
    console.log(bold("  using HTTP server: " + yellow(serverType)));
  });
  await app.listen({ hostname: "127.0.0.1", port: 8000 });
  console.log(bold("Finished."));
}

export function on<T extends WebhookEventName>(
  name: T,
  handler: (
    payload: WebhookEventMap[T],
    context: Context,
  ) => void,
) {
  const handlers = eventHandlerMap.get(name) ?? [];
  handlers.push(handler);
  eventHandlerMap.set(name, handlers);
}

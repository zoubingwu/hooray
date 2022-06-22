# Hooray

Write you own GitHub webhooks with [Deno Deploy](https://deno.com/deploy). Deno
Deploy is where you can distrubute your JavaScript/TypeScript code to the edge
with one line of command.

## Quickstart

Setup your Deno Deploy account and create a new project then write your webhook
logic in TypeScript with full typing support.

```ts
// main.ts
import { on, start } from "https://deno.land/x/ghook/mod.ts";

on("issue_comment", (payload) => {
  console.log("test");
  console.log(
    `${payload.comment.user.login} commented: ${payload.comment.body} `,
  );
});

start();
```

You can just copy the code into Deno Deploy's playground or deploy it with
[deployctl](https://github.com/denoland/deployctl):

```sh
deployctl deploy --project=YOUR_PROJECT_NAME --prod ./main.ts
```

Now copy the URL of the webhook and paste it in the GitHub repo's webhook
settings, the default pathname is `/webhook`, so the url will be
`https://YOUR_PROJECT_NAME.deno.dev/webhook`.

This pathname can be changed with options passed to `start`:

```ts
start({
  pathname: "/my-webhook",
});
```

You can also pass a secret so it can verify the request is from the right GitHub
repo. Remember to set the secret both in the GitHub repo's webhook settings and
deno deploy's Environment Variables settings.

```ts
start({
  secret: Deno.env.get("GITHUB_WEBHOOK_SECRET"),
});
```

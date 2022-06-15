# Hooray

Write you own GitHub webhooks with Deno Deploy.

## Quickstart

Write your own webhook logic with full typings support in TypeScript. You can notify other parties like Discord, Slack, etc.

```ts
// main.ts
import { on, start } from "https://deno.land/x/ghook/mod.ts";

on("issue_comment", (payload) => {
  console.log('test');
  console.log(`${payload.comment.user.login} commented: ${payload.comment.body} `);
});

start();
```

Then deploy it with [deployctl](https://github.com/denoland/deployctl):

```sh
deployctl deploy --project=YOUR_PROJECT_NAME --prod ./main.ts
```

Now you can copy the URL of the webhook and paste it in the GitHub repo's webhook settings, the default pathname is `/webhook`, so the url will be `https://YOUR_PROJECT_NAME.deno.dev/webhook`.

This pathname can be changed with options passed to `start`:

```ts
start({
  pathname: "/my-webhook",
});
```

You can also pass a secret so it can verify the request is from the right GitHub repo. Remember to set the secret both in the GitHub repo's webhook settings and deno deploy's Environment Variables settings.

```ts
start({
  secret: Deno.env.get("GITHUB_WEBHOOK_SECRET"),
});
```
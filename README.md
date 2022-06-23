# Hooray

Write you own GitHub webhooks with [Deno Deploy](https://deno.com/deploy). Deno
Deploy is where you can distribute your JavaScript/TypeScript code to the edge
with one line of command.

## Quick start

Setup your Deno Deploy account and create a new project then write your webhook
logic in TypeScript with full typing support.

```ts
// main.ts
import {
  app,
  makeLarkSender,
  pullRequest,
  pullRequestReview,
} from "https://deno.land/x/ghook/mod.ts";

const send = makeLarkSender(YOUR_LARK_ENDPOINT);

app("/webhook", { secret: "test" })
  .on("pull_request", (e) => send(pullRequest(e)))
  .on("pull_request_review", (e) => send(pullRequestReview(e)));
```

Now copy the code into Deno Deploy's playground or deploy it with
[deployctl](https://github.com/denoland/deployctl):

```sh
deployctl deploy --project=YOUR_PROJECT_NAME --prod ./main.ts
```

Copy the URL of the webhook and paste it in the GitHub repo's webhook settings,
the pathname in the example code is `/webhook`, so the url will be
`https://YOUR_PROJECT_NAME.deno.dev/webhook`.

You can also create multiple endpoints for different repos so you can reuse some
code. Just call app multiple times:

```ts
app("/webhook1");
app("/webhook2");
app("/webhook3");
```

It also provided some function to generate markdown texts in reponse to certain
GitHub events including `pullRequest`, `pullRequestReview`, etc.

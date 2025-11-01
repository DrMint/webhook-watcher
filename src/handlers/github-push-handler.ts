import { $ } from "bun";
import type { Handler } from "@/handlers/handler";

type GitHubPushEvent = {
  /* The full git ref that was pushed. Example: refs/heads/main or refs/tags/v3.14.1. */
  ref: string;
  /* Metaproperties for Git author/committer information. */
  pusher: {
    name: string;
    email: string;
  };
  repository: {
    id: number;
    full_name: string;
  };
};

export const gitHubPushHandler: Handler = async (
  request: Request,
  next: () => Promise<Response> | Response
): Promise<Response> => {
  // Check if the request is a GitHub push event
  if (request.headers.get("x-github-event") !== "push") {
    return next();
  }

  const event = (await request.json()) as GitHubPushEvent;

  const author = event.pusher.name;
  const branch = event.ref;
  const repository = event.repository.full_name;

  if (author !== "DrMint") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (branch !== "main") {
    return new Response("200 OK", { status: 200 });
  }

  switch (repository) {
    case "DrMint/webhook-watcher":
      await $`pm2 restart run_webhook-watcher`;
      return new Response("200 OK", { status: 200 });
    case "DrMint/r-entries.com":
      await $`pm2 restart run_r-entries`;
      return new Response("200 OK", { status: 200 });
    default:
      return new Response("Not found", { status: 404 });
  }
};

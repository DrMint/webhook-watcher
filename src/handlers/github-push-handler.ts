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

  console.log("Received a GitHub push event webhook.");

  const event = (await request.json()) as GitHubPushEvent;

  const author = event.pusher.name;
  const branch = event.ref;
  const repository = event.repository.full_name;

  if (author !== "DrMint") {
    return new Response("Unauthorized", { status: 401 });
  }

  if (branch !== "refs/heads/main") {
    return new Response("Accepted", { status: 202 });
  }

  console.log(
    `New commit pushed on the ${branch} branch of ${repository} by ${author}. Triggering a restart.`
  );

  switch (repository) {
    case "Accords-Library/memorial.accords-library.com":
      await $`pm2 restart run_al-memorial`;
      return new Response("OK", { status: 200 });
    case "DrMint/custom-exporter":
      await $`pm2 restart run_custom-exporter`;
      return new Response("OK", { status: 200 });
    case "DrMint/o3studio.net":
      await $`pm2 restart run_o3studio`;
      return new Response("OK", { status: 200 });
    case "DrMint/r-entries.com":
      await $`pm2 restart run_r-entries`;
      return new Response("OK", { status: 200 });
    case "DrMint/webhook-watcher":
      await $`pm2 restart run_webhook-watcher`;
      return new Response("OK", { status: 200 });
    default:
      console.log(`This repository (${repository}) is not supported.`);
      return new Response("Accepted", { status: 202 });
  }
};

import { $ } from "bun";
import type { Handler } from "@/handlers/handler";
import { Webhooks } from "@octokit/webhooks";

const octokit = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET ?? "",
});

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

  // Check if the request has a signature
  const signature = request.headers.get("x-hub-signature-256");
  if (!signature) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if the signature is valid
  const body = await request.text();
  if (!(await octokit.verify(body, signature))) {
    return new Response("Unauthorized", { status: 401 });
  }

  // Check if the body is a valid JSON object
  let event: GitHubPushEvent;
  try {
    event = JSON.parse(body) as GitHubPushEvent;
  } catch (error) {
    console.error("Failed to parse the event:", error);
    return new Response("Bad Request", { status: 400 });
  }

  const author = event.pusher.name;
  const branch = event.ref;
  const repository = event.repository.full_name;

  if (branch !== "refs/heads/main") {
    return new Response("Accepted", { status: 202 });
  }

  console.log(
    `New commit pushed on the ${branch} branch of ${repository} by ${author}. Triggering a restart.`
  );

  switch (repository) {
    case "Accords-Library/memorial.accords-library.com":
      await $`docker compose --project-directory /services/al-memorial down`;
      await $`docker compose --project-directory /services/al-memorial up -d --build`;
      return new Response("OK", { status: 200 });
    case "DrMint/custom-exporter":
      await $`pm2 restart run_custom_exporter`;
      return new Response("OK", { status: 200 });
    case "DrMint/o3studio.net":
      await $`docker compose --project-directory /services/o3studio down`;
      await $`docker compose --project-directory /services/o3studio up -d --build`;
      return new Response("OK", { status: 200 });
    case "DrMint/r-entries.com":
      await $`docker compose --project-directory /services/r-entries down`;
      await $`docker compose --project-directory /services/r-entries up -d --build`;
      return new Response("OK", { status: 200 });
    case "DrMint/webhook-watcher":
      await $`pm2 restart run_webhook-watcher`;
      return new Response("OK", { status: 200 });
    case "TS-Four-Souls/game":
      await $`pm2 restart run_four-souls-server`;
      return new Response("OK", { status: 200 });
    case "TS-Four-Souls/front-astro":
      await $`pm2 restart run_four-souls-front`;
      return new Response("OK", { status: 200 });
    default:
      console.log(`This repository (${repository}) is not supported.`);
      return new Response("Accepted", { status: 202 });
  }
};

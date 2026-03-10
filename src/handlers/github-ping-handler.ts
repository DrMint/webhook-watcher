import type { Handler } from "@/handlers/handler";
import { Webhooks } from "@octokit/webhooks";

const octokit = new Webhooks({
  secret: process.env.GITHUB_WEBHOOK_SECRET ?? "",
});

export const gitHubPingHandler: Handler = async (
  request: Request,
  next: () => Promise<Response> | Response
): Promise<Response> => {
  // Check if the request is a GitHub push event
  if (request.headers.get("x-github-event") !== "ping") {
    return next();
  }

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

  return new Response("OK", { status: 200 });
};

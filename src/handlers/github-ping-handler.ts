import type { Handler } from "@/handlers/handler";

export const gitHubPingHandler: Handler = async (
  request: Request,
  next: () => Promise<Response> | Response
): Promise<Response> => {
  // Check if the request is a GitHub push event
  if (request.headers.get("x-github-event") !== "ping") {
    return next();
  }
  return new Response("OK", { status: 200 });
};

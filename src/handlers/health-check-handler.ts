import type { Handler } from "@/handlers/handler";

export const healthCheckHandler: Handler = async (
  request: Request,
  next: () => Promise<Response> | Response
): Promise<Response> => {
  const url = new URL(request.url);
  if (url.pathname !== "/health-check") {
    return next();
  }
  console.log("Received a health check request.");
  return new Response("healthy", { status: 200 });
};

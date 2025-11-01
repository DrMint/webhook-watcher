import type { FallbackHandler } from "@/handlers/handler";

export const fallbackHandler: FallbackHandler = () => {
  console.log("Received a webhook that was not handled by any handler.");
  return new Response("Not Found", { status: 404 });
};
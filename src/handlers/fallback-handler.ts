import type { FallbackHandler } from "@/handlers/handler";

export const fallbackHandler: FallbackHandler = () => {
  return new Response("Not Found", { status: 404 });
};
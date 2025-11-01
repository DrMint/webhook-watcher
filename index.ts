import { Endpoint } from "@/handlers/handler";
import { gitHubPushHandler } from "@/handlers/github-push-handler";
import { fallbackHandler } from "@/handlers/fallback-handler";
import { healthCheckHandler } from "@/handlers/health-check-handler";
import { getArgs } from "@/parse-args";

const args = getArgs();

const endpoint = new Endpoint(fallbackHandler);
endpoint.addHandler(gitHubPushHandler);
endpoint.addHandler(healthCheckHandler);

const server = Bun.serve({
  port: args.port,
  fetch: endpoint.fetch,
});

console.log(`Server running at ${server.url}`);

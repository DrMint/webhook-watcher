import { parseArgs } from "util";

const { values } = parseArgs({
  args: Bun.argv,
  options: {
    port: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

const port = parseInt(values.port ?? "3000");

const server = Bun.serve({
  port,
  fetch: async (req) => {
    let body: unknown;
    try {
        body = await req.json();
    } catch {
        // No JSON body
    }
    const headers = req.headers;
    console.log({ body, headers });
    return new Response("OK");
  },
});

console.log(`Server running at ${server.url}`);

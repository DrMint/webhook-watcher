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
    const body = await req.json();
    const headers = req.headers;
    console.log({ body, headers });
    return new Response("OK");
  },
});

console.log(`Server running at ${server.url}`);

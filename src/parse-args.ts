import { parseArgs } from "util";

type Args = {
  port: number;
};

export const getArgs = (): Args => {
  const { values } = parseArgs({
    args: Bun.argv,
    options: {
      port: {
        type: "string",
      },
    },
    allowPositionals: true,
    strict: true,
  });

  return { port: values.port ? parseInt(values.port) : 3000 };
};

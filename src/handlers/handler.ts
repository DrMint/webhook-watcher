export type Handler = (
  req: Request,
  next: () => Promise<Response> | Response
) => Promise<Response> | Response;

export type FallbackHandler = (req: Request) => Promise<Response> | Response;

export class Endpoint {
  private handlers: Handler[] = [];
  private fallbackHandler: FallbackHandler;

  constructor(fallbackHandler: FallbackHandler) {
    this.fallbackHandler = fallbackHandler;
  }

  addHandler(handler: Handler) {
    this.handlers.push(handler);
  }

  get fetch(): (req: Request) => Promise<Response> {
    return this.composeHandlers(this.handlers, this.fallbackHandler);
  }

  private composeHandlers = (
    handlers: Handler[],
    fallbackHandler: FallbackHandler
  ): ((req: Request) => Promise<Response>) => {
    return (req) => {
      const dispatch = async (i: number): Promise<Response> =>
        handlers[i]?.(req, () => dispatch(i + 1)) ?? fallbackHandler(req);
      return dispatch(0);
    };
  };
}

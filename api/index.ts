import serverEntry from '../src/server';

export default {
  async fetch(request: Request): Promise<Response> {
    return await serverEntry.fetch(request as Request, undefined, undefined);
  },
};

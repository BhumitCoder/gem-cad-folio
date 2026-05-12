import serverEntry from '../src/server';

export const config = {
  runtime: 'edge',
};

export default async function handler(request: Request): Promise<Response> {
  return await serverEntry.fetch(request as Request);
}

import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  console.log('Test route hit!');
  return new Response();
};

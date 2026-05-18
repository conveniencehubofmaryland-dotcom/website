/**
 * Creates a _worker.js wrapper for Cloudflare Pages Advanced Mode.
 *
 * In Pages Advanced Mode, _worker.js intercepts ALL requests including
 * static assets. This wrapper first tries env.ASSETS.fetch() (which serves
 * static files from the Pages KV store), and falls through to the OpenNext
 * Worker only for requests that don't match a static asset.
 */
import { writeFileSync } from 'fs';

const wrapper = `import worker from './worker.js';

export default {
  async fetch(request, env, ctx) {
    try {
      const assetResponse = await env.ASSETS.fetch(request.clone());
      if (assetResponse.status !== 404) return assetResponse;
    } catch {}
    return worker.fetch(request, env, ctx);
  },
};
`;

writeFileSync('.open-next/_worker.js', wrapper);
console.log('Created _worker.js ASSETS wrapper for Cloudflare Pages');

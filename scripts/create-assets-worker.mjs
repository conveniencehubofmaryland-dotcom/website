import { writeFileSync } from 'fs';

const wrapper = `import worker from './worker.js';

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'GET' || request.method === 'HEAD') {
      try {
        const assetResponse = await env.ASSETS.fetch(request.clone());
        if (assetResponse.status !== 404) return assetResponse;
      } catch {}
    }
    return worker.fetch(request, env, ctx);
  },
};
`;

writeFileSync('.open-next/_worker.js', wrapper);
console.log('Created _worker.js ASSETS wrapper for Cloudflare Pages');

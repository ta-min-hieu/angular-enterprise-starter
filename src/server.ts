import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';

const browserDistFolder = join(import.meta.dirname, '../browser');

// Angular CLI fingerprint filename có content hash (vd. main-DL3O6C2H.js) nên có thể
// cache dài hạn an toàn. File tĩnh khác (i18n/*.json, config.json, favicon.ico...) giữ
// nguyên tên qua mỗi lần deploy nên phải luôn revalidate, tránh trình duyệt dùng bản cũ.
const HASHED_ASSET_PATTERN = /-[a-z0-9]{8,}\.(js|css|woff2?|ttf|eot)$/i;

const app = express();
const angularApp = new AngularNodeAppEngine({
  // Nginx (docker/nginx.conf) là reverse proxy tin cậy đứng trước Node — cho phép
  // đọc X-Forwarded-* để Angular xác định đúng scheme/host gốc từ client.
  trustProxyHeaders: true,
});

/**
 * Example Express Rest API endpoints can be defined here.
 * Uncomment and define endpoints as necessary.
 *
 * Example:
 * ```ts
 * app.get('/api/{*splat}', (req, res) => {
 *   // Handle API request
 * });
 * ```
 */

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
    setHeaders: (res, path) => {
      if (!HASHED_ASSET_PATTERN.test(path)) {
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) => (response ? writeResponseToNodeResponse(response, res) : next()))
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 * The server listens on the port defined by the `PORT` environment variable, or defaults to 4000.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }

    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

/**
 * Request handler used by the Angular CLI (for dev-server and during build) or Firebase Cloud Functions.
 */
export const reqHandler = createNodeRequestHandler(app);

import { defineConfig } from 'cypress';
import fs from 'fs';
import path from 'path';

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1440,
    viewportHeight: 900,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 12000,
    requestTimeout: 15000,
    responseTimeout: 15000,
    setupNodeEvents(on) {
      on('task', {
        compareSnapshots({
          snapshotName,
          screenshotPath,
        }: {
          snapshotName: string;
          screenshotPath: string;
        }) {
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const { PNG } = require('pngjs');
          // eslint-disable-next-line @typescript-eslint/no-require-imports
          const pixelmatch = require('pixelmatch');

          const absScreenshot = path.resolve(__dirname, screenshotPath);
          const baselineDir = path.resolve(__dirname, 'cypress/snapshots/baseline');
          const diffDir = path.resolve(__dirname, 'cypress/snapshots/diff');
          const baselinePath = path.join(baselineDir, `${snapshotName}.png`);

          fs.mkdirSync(baselineDir, { recursive: true });
          fs.mkdirSync(diffDir, { recursive: true });

          if (!fs.existsSync(baselinePath)) {
            fs.copyFileSync(absScreenshot, baselinePath);
            return null;
          }

          const img1 = PNG.sync.read(fs.readFileSync(baselinePath));
          const img2 = PNG.sync.read(fs.readFileSync(absScreenshot));

          if (img1.width !== img2.width || img1.height !== img2.height) {
            throw new Error(
              `Snapshot size mismatch for "${snapshotName}": ` +
                `baseline ${img1.width}x${img1.height} vs current ${img2.width}x${img2.height}`
            );
          }

          const { width, height } = img1;
          const diff = new PNG({ width, height });
          const numDiffPixels = pixelmatch(img1.data, img2.data, diff.data, width, height, {
            threshold: 0.1,
          });

          fs.writeFileSync(path.join(diffDir, `${snapshotName}.png`), PNG.sync.write(diff));

          const diffPercent = (numDiffPixels / (width * height)) * 100;
          if (diffPercent > 3) {
            throw new Error(
              `Visual regression in "${snapshotName}": ${diffPercent.toFixed(2)}% pixels differ (threshold: 3%)`
            );
          }

          return null;
        },
      });
    },
    env: {
      agentEmail: 'agent@insure.com',
      agentPassword: 'secret123',
      authUrl: 'http://35.157.14.12:8081',
      customerUrl: 'http://35.157.14.12:8082',
      policyUrl: 'http://35.157.14.12:8083',
      aiUrl: 'http://35.157.14.12:8084',
    },
  },
});

/* © 2025 Tiger X Panel — Proprietary/UI modules by Jan Köppke. Do not copy without permission.
*/

import { config } from './config.js';
import { connectDB } from './lib/db.js';
import app from './app.js';
import { autoSeedAdmin } from './lib/auto-seed.js';

connectDB()
  .then(async () => {
    await autoSeedAdmin();
    app.listen(config.port, () => console.log(`✓ API on :${config.port}`));
  })
  .catch((e) => { console.error(e); process.exit(1); });
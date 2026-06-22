import { config } from 'dotenv';

config({ path: '.env.local' });

import { verifyConnection, closeDriver } from '../lib/neo4j/driver';
import { ensureSchema } from '../lib/neo4j/schema';

async function main(): Promise<void> {
  console.log('[db] verifying connection…');
  await verifyConnection();
  console.log('[db] applying constraints & indexes…');
  await ensureSchema();
  console.log('[db] ready.');
}

main()
  .catch((error) => {
    console.error('[db] init failed:', error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(closeDriver);

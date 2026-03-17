import { createApp } from './app.js';
import { env } from './config/env.js';
import { initDb } from './db/initDb.js';
import { userService } from './services/userService.js';
import { gmailFetchService } from './services/gmailFetchService.js';

initDb();

if (userService.count() === 0) {
  userService.createMany([
    { name: 'Carlos Silva', role: 'account-manager', isAvailable: true },
    { name: 'Mariana Souza', role: 'support-operator', isAvailable: true },
    { name: 'Rafael Oliveira', role: 'community-manager', isAvailable: true }
  ]);
}

const app = createApp();

app.listen(env.port, () => {
  console.log(`API running on http://localhost:${env.port}`);
  gmailFetchService.start();
});
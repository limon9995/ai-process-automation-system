import { initDb } from '../db/initDb.js';
import { userService } from '../services/userService.js';
import { workflowService } from '../services/workflowService.js';
import { demoMessages } from './demoMessages.js';
import { db } from '../db/database.js';

initDb();

if (userService.count() === 0) {
  userService.createMany([
    { name: 'Carlos Silva', role: 'account-manager', isAvailable: true },
    { name: 'Fernanda Lima', role: 'account-manager', isAvailable: true },
    { name: 'Mariana Souza', role: 'support-operator', isAvailable: true },
    { name: 'Rafael Oliveira', role: 'support-operator', isAvailable: true },
    { name: 'Beatriz Mendes', role: 'community-manager', isAvailable: true }
  ]);
  console.log('Seed: 5 operators created.');
}

const existingMessages = db.prepare('SELECT COUNT(*) as count FROM messages').get().count;

if (existingMessages === 0) {
  console.log(`Seed: processing ${demoMessages.length} demo messages...`);
  for (const message of demoMessages) {
    await workflowService.processIncomingMessage(message);
  }
  console.log('Seed: all demo messages processed.');
}

console.log('Seed completed successfully.');

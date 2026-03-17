import fs from 'fs';
import { env } from '../config/env.js';

if (fs.existsSync(env.dbPath)) {
  fs.rmSync(env.dbPath);
  console.log(`Removed database: ${env.dbPath}`);
} else {
  console.log(`Database did not exist: ${env.dbPath}`);
}

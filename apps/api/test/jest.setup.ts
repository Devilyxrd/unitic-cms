import * as path from 'path';
import * as dotenv from 'dotenv';

// Load .env file from project root for E2E tests
dotenv.config({
  path: path.resolve(__dirname, '../../..', '.env'),
});

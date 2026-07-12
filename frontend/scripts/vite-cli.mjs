import crypto from 'node:crypto';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

if (!crypto.getRandomValues) {
  crypto.getRandomValues = function (arr) {
    return crypto.randomFillSync(arr);
  };
}

if (typeof globalThis.crypto === 'undefined' || !globalThis.crypto.getRandomValues) {
  globalThis.crypto = crypto.webcrypto || {
    getRandomValues: (arr) => crypto.randomFillSync(arr)
  };
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binPath = path.join(__dirname, '../node_modules/vite/bin/vite.js');
await import(pathToFileURL(binPath).href);

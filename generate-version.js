import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionFilePath = path.join(__dirname, 'client', 'public', 'version.json');
const versionData = {
  version: Date.now().toString(),
  timestamp: new Date().toISOString()
};

if (!fs.existsSync(path.join(__dirname, 'client', 'public'))) {
  fs.mkdirSync(path.join(__dirname, 'client', 'public'), { recursive: true });
}

fs.writeFileSync(versionFilePath, JSON.stringify(versionData, null, 2));

console.log(`✅ Build version generated: ${versionData.version} (${versionData.timestamp})`);

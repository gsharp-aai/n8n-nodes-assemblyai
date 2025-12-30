// Syncs AAI_NODE_VERSION in version.ts with package.json version.
// Helps to track which requests originate from n8n and which version of the n8n node is being used.
const fs = require('fs');
const path = require('path');

const packageJson = require('../package.json');
const versionFilePath = path.join(__dirname, '../nodes/Assemblyai/version.ts');

let content = fs.readFileSync(versionFilePath, 'utf8');

content = content.replace(
  /(export const AAI_NODE_VERSION = ['"])([^'"]+)(['"])/,
  `$1${packageJson.version}$3`
);

fs.writeFileSync(versionFilePath, content, 'utf8');
console.log(`✅ Synced AAI_NODE_VERSION to ${packageJson.version}`);
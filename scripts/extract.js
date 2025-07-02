// scripts/extract-consts.js
const https = require('https');
const fs = require('fs');
const path = require('path');

const RAW_URL =
  'https://raw.githubusercontent.com/mixmaxhq/role-based-email-addresses/master/src/index.js';
const TMP_DIR = path.join(__dirname, 'tmp');
const TMP_FILE = path.join(TMP_DIR, 'index.js');
const OUT_FILE = path.join(__dirname, '..', 'list.txt');

async function fetchAndSave() {
  await fs.promises.mkdir(TMP_DIR, { recursive: true });
  return new Promise((resolve, reject) => {
    https.get(RAW_URL, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`Failed to fetch: ${res.statusCode}`));
      }
      const file = fs.createWriteStream(TMP_FILE);
      res.pipe(file).on('finish', () => file.close(resolve));
    }).on('error', reject);
  });
}

async function buildList() {
  // 1. Fetch the remote JS
  await fetchAndSave();

  // 2. Require it (module.exports is the full array)
  const items = require(TMP_FILE);

  // 3. Dedupe & sort
  const unique = Array.from(new Set(items)).sort((a, b) =>
    a.localeCompare(b, 'en', { sensitivity: 'base' })
  );

  // 4. Write to list.txt
  await fs.promises.writeFile(OUT_FILE, unique.join('\n'));
}

buildList().catch(err => {
  console.error(err);
  process.exit(1);
});

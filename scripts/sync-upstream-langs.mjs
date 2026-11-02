#!/usr/bin/env node

/**
 * Merges the translations from upstream (iamcal/enchant-order) into public/languages/.
 * Upstream values replace local ones for the same key, and keys only the local files have are kept.
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const LOCAL_DIR = join(ROOT, 'public', 'languages');

const isObject = (value) => typeof value === 'object' && value !== null && !Array.isArray(value);

function deepMerge(local, upstream) {
  const result = { ...local };
  for (const [key, value] of Object.entries(upstream)) {
    result[key] = isObject(value) && isObject(result[key]) ? deepMerge(result[key], value) : value;
  }
  return result;
}

console.log('Fetching upstream...');
execSync('git fetch upstream', { cwd: ROOT, stdio: 'inherit' });

const lsOutput = execSync('git ls-tree --name-only upstream/main languages/', {
  cwd: ROOT,
  encoding: 'utf-8',
});
const files = lsOutput
  .trim()
  .split('\n')
  .filter((f) => f.endsWith('.json'));

let added = 0;
let updated = 0;
let unchanged = 0;

for (const upstreamPath of files) {
  const filename = upstreamPath.split('/').pop();
  const localPath = join(LOCAL_DIR, filename);

  const upstreamRaw = execSync(`git show upstream/main:${upstreamPath}`, {
    cwd: ROOT,
    encoding: 'utf-8',
  });
  const upstreamJson = JSON.parse(upstreamRaw);

  if (!existsSync(localPath)) {
    writeFileSync(localPath, JSON.stringify(upstreamJson, null, 4) + '\n', 'utf-8');
    console.log(`  + ${filename} (new)`);
    added++;
    continue;
  }

  const localRaw = readFileSync(localPath, 'utf-8');
  const localJson = JSON.parse(localRaw);
  const merged = deepMerge(localJson, upstreamJson);
  const mergedStr = JSON.stringify(merged, null, 4) + '\n';

  if (mergedStr !== localRaw) {
    writeFileSync(localPath, mergedStr, 'utf-8');
    console.log(`  ~ ${filename}`);
    updated++;
  } else {
    unchanged++;
  }
}

console.log(`\nDone. ${added} added, ${updated} updated, ${unchanged} unchanged.`);

#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const srcDir = path.resolve(__dirname, '../src');

// Allowed files where raw Date construction is permitted
const ALLOWED_FILES = [
  'src/utils/dateUtils.ts',
  'src/utils/__tests__/',
  '.test.ts',
  '.test.tsx'
];

// Patterns that indicate date manipulation or parsing which should use dateUtils.ts
const SUSPECT_PATTERNS = [
  /\.toISOString\(\)\.split\(['"`]T['"`]\)\[0\]/, // building date string
  /new Date\(\s*[a-zA-Z0-9_]+,\s*[a-zA-Z0-9_]+/,  // new Date(y, m, ...)
  /new Date\(Date\.UTC\(/,                         // new Date(Date.UTC(...))
  /new Date\(Date\.now\(\)\s*[-+]/,                // new Date(Date.now() - 86400000)
  /\.setDate\(/,                                   // manual day shifting
  /\.setUTCDate\(/,                                // manual UTC day shifting
  /new Date\([^)]+\)\.toDateString\(\)/            // toDateString comparisons
];

function isAllowedFile(relativePath) {
  return ALLOWED_FILES.some(allowed => relativePath.includes(allowed));
}

function scanDirectory(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const violations = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(path.resolve(__dirname, '..'), fullPath);

    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        violations.push(...scanDirectory(fullPath));
      }
    } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
      if (isAllowedFile(relativePath)) {
        continue;
      }

      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (line.includes('// date-safe') || line.includes('// date-allowed')) {
          return;
        }

        for (const pattern of SUSPECT_PATTERNS) {
          if (pattern.test(line)) {
            violations.push({
              file: relativePath,
              line: index + 1,
              code: line.trim(),
              pattern: pattern.toString()
            });
            break;
          }
        }
      });
    }
  }

  return violations;
}

const violations = scanDirectory(srcDir);

if (violations.length > 0) {
  console.log(`\n❌ [DATE UTILS GUARD] Found ${violations.length} non-canonical date constructions/mutations outside dateUtils.ts:`);
  console.log('To prevent DST and midnight discrepancies, please use canonical date helpers:');
  console.log('  - getLocalDateString(d?)');
  console.log('  - parseDateSafe(str)');
  console.log('  - addDays(dateStr, days)');
  console.log('  - getWeekdayStr(dateStr)');
  console.log('  - getSystemTimestamp()\n');

  violations.forEach(v => {
    console.log(`  ${v.file}:${v.line} -> ${v.code}`);
  });
  console.log('\n(Add `// date-safe` on the line if this is an explicit exception)\n');
  process.exit(1);
} else {
  console.log('✅ [DATE UTILS GUARD] 0 non-canonical date mutations or parsing found outside dateUtils.ts.');
  process.exit(0);
}

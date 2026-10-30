import { readdirSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
const files = readdirSync(new URL('../tests/', import.meta.url)).filter(n => n.endsWith('.test.mjs') && n !== 'rendered-html.test.mjs').sort().map(n => 'tests/' + n);
const result = spawnSync(process.execPath, ['--test', ...files], { cwd: new URL('..', import.meta.url), stdio: 'inherit' });
process.exit(result.status ?? 1);

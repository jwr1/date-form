import {execSync} from 'child_process';
import {rmSync, mkdirSync, renameSync, copyFileSync, rmdirSync} from 'fs';

rmSync('dist', {force: true, recursive: true});
mkdirSync('dist');

mkdirSync('dist/ts');
execSync('tsc --module CommonJS');
renameSync('dist/ts/index.js', 'dist/index.js');
execSync('tsc --module ESNext');
renameSync('dist/ts/index.js', 'dist/index.mjs');
renameSync('dist/ts/index.d.ts', 'dist/index.d.ts');
rmdirSync('dist/ts');

for (const file of ['package.json', 'README.md', 'LICENSE']) {
  copyFileSync(file, 'dist/' + file);
}

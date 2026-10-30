#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const manifest=fs.readFileSync(path.join(root,'SHA256SUMS.txt'),'utf8').trim().split('\n');
let checked=0;const failed=[];
for(const line of manifest){const m=line.match(/^([0-9a-f]{64})  (.+)$/);if(!m||m[2].split('/').some(p=>!p||p==='.'||p==='..')||m[2].startsWith('/')||m[2].includes('\\'))throw new Error('Invalid checksum entry');const p=path.join(root,m[2]);try{if(!fs.lstatSync(p).isFile()||fs.lstatSync(p).isSymbolicLink())throw new Error('Not a regular file');const value=crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');if(value!==m[1])failed.push(m[2]);checked++;}catch{failed.push(m[2]);}}
console.log(JSON.stringify({checked,failed},null,2));if(failed.length)process.exitCode=1;

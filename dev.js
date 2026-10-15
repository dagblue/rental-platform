#!/usr/bin/env node
/**
 * dev.js — starts backend and frontend in parallel
 * Usage: node dev.js   OR   npm run dev
 */
'use strict';

const { spawn } = require('child_process');
const path = require('path');

const ROOT   = __dirname;
const RESET  = '\x1b[0m';
const CYAN   = '\x1b[36m';
const MAGENTA = '\x1b[35m';

// Resolve npm executable — on Windows use the .cmd shim with shell:true
const isWin  = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function startProcess(label, cwd, color) {
  const proc = spawn(npmCmd, ['run', 'dev'], {
    cwd,
    shell: isWin,          // shell needed on Windows for .cmd files
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  });

  const prefix = `${color}[${label}]${RESET} `;

  proc.stdout.on('data', (d) => {
    d.toString().split('\n').forEach((line) => {
      if (line.trim()) process.stdout.write(prefix + line + '\n');
    });
  });

  proc.stderr.on('data', (d) => {
    d.toString().split('\n').forEach((line) => {
      if (line.trim()) process.stderr.write(prefix + line + '\n');
    });
  });

  proc.on('exit', (code) =>
    console.log(`\n${prefix}process exited with code ${code ?? 0}`)
  );

  proc.on('error', (err) =>
    console.error(`${prefix}failed to start: ${err.message}`)
  );

  return proc;
}

console.log(`\n  ${CYAN}[BACKEND]${RESET}   → http://localhost:3001`);
console.log(`  ${MAGENTA}[FRONTEND]${RESET}  → http://localhost:3000\n`);

const backend  = startProcess('BACKEND',  path.join(ROOT, 'apps', 'backend'),  CYAN);
const frontend = startProcess('FRONTEND', path.join(ROOT, 'apps', 'frontend'), MAGENTA);

// Ctrl+C kills both cleanly
process.on('SIGINT', () => {
  backend.kill('SIGTERM');
  frontend.kill('SIGTERM');
  process.exit(0);
});

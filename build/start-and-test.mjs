/**
 * 启动服务（第一个参数），运行测试（第二个参数），随后关闭服务
 */

import { spawn } from 'child_process';

const SERVE_SCRIPT = process.argv[2];
const TEST_SCRIPT = process.argv[3];

const serveProcess = spawn('pnpm', SERVE_SCRIPT.split(' '), {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true,
});

const testProcess = spawn('pnpm', TEST_SCRIPT.split(' '), {
  stdio: 'inherit',
  cwd: process.cwd(),
  shell: true,
});

testProcess.on('exit', () => {
  serveProcess.kill();
});

process.on('SIGINT', () => {
  testProcess.kill();
  serveProcess.kill();
  process.exit();
});

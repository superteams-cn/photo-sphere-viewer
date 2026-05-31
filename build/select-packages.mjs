/**
 * 选择要使用的包
 * 返回供 Turbo 使用的 '--filter' 参数
 */

import enquirer from 'enquirer';
import fs from 'fs';
import process from 'process';

const PACKAGES_DIR = 'packages';
const packages = fs.readdirSync(PACKAGES_DIR).filter((name) => name !== 'shared' && name !== 'core');

const prompt = new enquirer.MultiSelect({
  name: 'packages',
  message: '请选择要构建的包',
  choices: [{ name: 'core', disabled: true }, ...packages],
  stdout: process.stderr,
});

prompt
  .run()
  .then((answers) => {
    const filters = answers.map((p) => `--filter=@photo-sphere-viewer/${p}`).join(' ');
    process.stdout.write(`--filter=// --filter=@photo-sphere-viewer/core ${filters}`);
  })
  .catch(() => {
    process.stdout.write('--filter=noop');
  });

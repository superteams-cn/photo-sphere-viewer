/**
 * 为 TypeDoc 生成 README 文件
 */

import path from 'path';
import { readdirSync } from 'fs';
import { mkdir, readFile, writeFile } from 'fs/promises';

const PACKAGES_DIR = 'packages';
const PKG_FILE = 'package.json';
const TYPEDOC_FILE = 'typedoc.json';
const DIST_DIR = '.tmp/typedoc';
const DIST_FILE = 'README.md';

(async () => {
  const packages = readdirSync(PACKAGES_DIR).filter((name) => name !== 'shared');

  const plugins = [];
  const adapters = [];

  for (const name of packages) {
    const pkgFile = path.join(PACKAGES_DIR, name, PKG_FILE);
    const typedocFile = path.join(PACKAGES_DIR, name, TYPEDOC_FILE);
    const distDir = path.join(PACKAGES_DIR, name, DIST_DIR);
    const destFile = path.join(distDir, DIST_FILE);

    const pkg = JSON.parse(await readFile(pkgFile, { encoding: 'utf8' }));
    const typedoc = JSON.parse(await readFile(typedocFile, { encoding: 'utf8' }));

    const content = `
NPM 包：[${pkg.name}](https://www.npmjs.com/package/${pkg.name})

文档：${pkg.homepage}
`.trim();

    console.log(`create ${destFile}`);
    await mkdir(distDir, { recursive: true });
    await writeFile(destFile, content);

    if (typedoc.name.endsWith('Plugin')) {
      plugins.push(typedoc.name);
    } else if (typedoc.name.endsWith('Adapter')) {
      adapters.push(typedoc.name);
    }
  }

  const distDir = DIST_DIR;
  const destFile = path.join(distDir, DIST_FILE);

  const content = `
# 核心

- {@link Core.Viewer | Viewer}
- {@link Core.events | events}
- {@link Core.utils | utils}

# 插件

${plugins.map((plugin) => `- {@link ${plugin}.${plugin} | ${plugin}}`).join('\n')}

# 适配器

${adapters.map((adapter) => `- {@link ${adapter}.${adapter} | ${adapter}}`).join('\n')}
`.trim();

  console.log(`create ${destFile}`);
  await mkdir(distDir, { recursive: true });
  await writeFile(destFile, content);
})();

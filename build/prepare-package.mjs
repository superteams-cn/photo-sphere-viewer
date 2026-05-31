/**
 * 将各个包的 "dist" 目录内容复制到根 "dist" 目录
 * 用于准备发布 ZIP
 */

import path from 'path';
import fs from 'fs-extra';

const PACKAGES_DIR = 'packages';
const DIST_DIR = 'dist';
const LICENSE_FILE = 'LICENSE';

fs.readdirSync(PACKAGES_DIR)
  .filter((name) => name !== 'shared')
  .forEach((name) => {
    const source = path.join(PACKAGES_DIR, name, DIST_DIR);
    const destination = path.join(DIST_DIR, name);

    console.log(`复制 ${name}`);

    fs.copySync(source, destination, {
      filter(name) {
        return (
          name === source ||
          ['/styles', '.module.js', '.cjs', '.css', '.scss', '.d.ts', '.d.mts', '.map', '.json'].some((ext) =>
            name.endsWith(ext),
          )
        );
      },
    });
  });

console.log(`复制 ${LICENSE_FILE}`);
fs.copySync(LICENSE_FILE, path.join(DIST_DIR, LICENSE_FILE));

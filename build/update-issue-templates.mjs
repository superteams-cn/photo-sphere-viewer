/**
 * 将第一个参数传入的版本号添加到 issue 模板选项中
 */

import fs from 'fs';
import yaml from 'yaml';

const VERSION = process.argv[2];
const MAX_VERSIONS = 10;
const OTHER_LABEL = 'other';

if (!VERSION) {
  console.warn('未提供版本号');
  process.exit(0);
}

['.github/ISSUE_TEMPLATE/bug_report.yml', '.github/ISSUE_TEMPLATE/support_request.yml'].forEach((filename) => {
  if (!fs.existsSync(filename)) {
    console.warn(`${filename} 不存在`);
    return;
  }

  const content = yaml.parse(fs.readFileSync(filename, { encoding: 'utf8' }));

  const item = content.body.find(({ id }) => id === 'version');
  if (!item) {
    console.warn(`在 ${filename} 中未找到下拉选项`);
    return;
  }

  const versions = item.attributes.options.filter((v) => v !== OTHER_LABEL);
  if (versions.indexOf(VERSION) !== -1) {
    console.warn(`版本 ${VERSION} 已存在于 ${filename}`);
    return;
  }

  console.log(`将 ${VERSION} 添加到 ${filename}`);
  versions.unshift(VERSION);
  if (versions.length > MAX_VERSIONS) {
    versions.splice(MAX_VERSIONS, versions.length - MAX_VERSIONS);
  }
  versions.push(OTHER_LABEL);

  item.attributes.options = versions;

  fs.writeFileSync(filename, yaml.stringify(content, { lineWidth: 0 }));
});

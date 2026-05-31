import assert from 'assert';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import path from 'path';

const testDir = path.join(import.meta.dirname, 'fixtures/generate-typedoc-readme');

describe('generate-typedoc-readme', () => {
  it('应生成 README', () => {
    execSync(`node ${path.join(import.meta.dirname, '../generate-typedoc-readme.mjs')}`, { cwd: testDir });

    const cases = {
      '.tmp/typedoc/README.md': `
# 核心

- {@link Core.Viewer | Viewer}
- {@link Core.events | events}
- {@link Core.utils | utils}

# 插件

- {@link TestPlugin.TestPlugin | TestPlugin}

# 适配器

- {@link TestAdapter.TestAdapter | TestAdapter}`,

      'packages/core/.tmp/typedoc/README.md': `
NPM 包：[@photo-sphere-viewer/core](https://www.npmjs.com/package/@photo-sphere-viewer/core)

文档：https://photo-sphere-viewer.js.org`,

      'packages/test-adapter/.tmp/typedoc/README.md': `
NPM 包：[@photo-sphere-viewer/test-adapter](https://www.npmjs.com/package/@photo-sphere-viewer/test-adapter)

文档：https://photo-sphere-viewer.js.org/adapters/test.html`,

      'packages/test-plugin/.tmp/typedoc/README.md': `
NPM 包：[@photo-sphere-viewer/test-plugin](https://www.npmjs.com/package/@photo-sphere-viewer/test-plugin)

文档：https://photo-sphere-viewer.js.org/plugins/test.html`,
    };

    Object.entries(cases).forEach(([file, expected]) => {
      const actual = readFileSync(path.join(testDir, file), { encoding: 'utf8' });
      assert.strictEqual(actual.trim(), expected.trim());
    });
  });
});

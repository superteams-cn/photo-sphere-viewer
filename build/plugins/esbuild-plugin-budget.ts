import type { Plugin } from 'esbuild';
import chalk from 'chalk';

/**
 * 检查最终打包体积
 */
export function budgetPlugin(budget: string): Plugin {
  if (!budget || !budget.endsWith('kb')) {
    throw new Error('缺少 budget，或 budget 无效。');
  }

  const maxsize = 1024 * parseInt(budget, 10);

  return {
    name: 'budget',
    setup(build) {
      build.onEnd((result) => {
        ['index.cjs', 'index.module.js'].forEach((filename) => {
          const file = result.outputFiles.find((f) => f.path.endsWith(filename));
          if (file) {
            if (file.contents.length > maxsize) {
              const size = Math.round(file.contents.length / 1024);
              throw chalk.red(`文件 ${filename} 超出 ${budget} 的体积限制，当前大小为 ${size}kb`);
            }
          }
        });
      });
    },
  };
}

/**
 * 根据覆盖率报告生成 Markdown 摘要
 */

import vm from 'node:vm';
import { readFileSync } from 'node:fs';

const TOTAL = '_total_';

const script = new vm.Script(readFileSync('cypress/reports/lcov-viewer/report-data.js'));
const context = vm.createContext({ window: {} });
script.runInContext(context);

const values = Object.values(context.window.COVERAGE_DATA).reduce((result, { metrics, path }) => {
  const module = path.split('/').shift();
  [TOTAL, module].forEach((key) => {
    const moduleMetrics = result[key] ?? {
      branches: { total: 0, covered: 0 },
      functions: { total: 0, covered: 0 },
      lines: { total: 0, covered: 0 },
    };

    moduleMetrics.branches.total += metrics.branches.total;
    moduleMetrics.branches.covered += metrics.branches.covered;
    moduleMetrics.functions.total += metrics.functions.total;
    moduleMetrics.functions.covered += metrics.functions.covered;
    moduleMetrics.lines.total += metrics.lines.total;
    moduleMetrics.lines.covered += metrics.lines.covered;

    result[key] = moduleMetrics;
  });
  return result;
}, {});

function percentWithColor({ covered, total }) {
  const percent = Math.round((covered / total) * 10000) / 100;
  const color = percent >= 80 ? '#248f29' : percent >= 60 ? '#d3b334' : '#d3343c';
  return `\${\\textsf{\\color{${color}}${percent.toFixed(1)}\\\\%}}$`;
}

const summary = `
# ${percentWithColor(values[TOTAL].lines)} 行，${percentWithColor(values[TOTAL].functions)} 函数，${percentWithColor(values[TOTAL].branches)} 分支

| 包 | 行数 | 行覆盖率 | 函数 | 函数覆盖率 | 分支 | 分支覆盖率 |
| ------- | -----:| ------------- | ---------:| ----------------- | --------:| ----------------|
${Object.entries(values)
  .filter(([name]) => name !== TOTAL)
  .map(([name, { lines, functions, branches }]) => {
    const entry = ({ covered, total }) => `${covered}/${total} | ${percentWithColor({ covered, total })}`;
    return `| **${name}** | ${entry(lines)} | ${entry(functions)} | ${entry(branches)} |`;
  })
  .join('\n')}
`;

process.stdout.write(summary);

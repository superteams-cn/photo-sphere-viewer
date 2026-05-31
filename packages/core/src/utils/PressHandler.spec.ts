import assert from 'assert';
import { PressHandler } from './PressHandler';

describe('utils:PressHandler', () => {
  it('应至少等待 X 毫秒后再执行', (done) => {
    const handler = new PressHandler(100);

    const start = new Date().getTime();

    handler.down();
    handler.up(() => {
      const elapsed = new Date().getTime() - start;
      // 在 CI runner 上偶尔会更快一些
      assert.ok(elapsed >= 98, `Expected ${elapsed} to be greater than 100`);
      done();
    });
  });

  it('若已超过 X 毫秒应立即执行', (done) => {
    const handler = new PressHandler(100);

    handler.down();

    setTimeout(() => {
      const start = new Date().getTime();
      handler.up(() => {
        const elapsed = new Date().getTime() - start;
        assert.ok(elapsed < 10, `Expected ${elapsed} to be lower than 10`);
        done();
      });
    }, 200);
  });
});

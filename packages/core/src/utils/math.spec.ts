import assert from 'assert';
import { greatArcDistance } from './math';

describe('utils:math:greatArcDistance', () => {
  it('应计算大圆弧距离', () => {
    // 简单情况
    assert.strictEqual(greatArcDistance([0, 0], [Math.PI, 0]), Math.PI);
    assert.strictEqual(greatArcDistance([Math.PI / 2, 0], [(3 * Math.PI) / 2, 0]), Math.PI);

    // 从左向右穿过原点
    assert.strictEqual(greatArcDistance([(7 * Math.PI) / 4, 0], [Math.PI / 4, 0]), Math.PI / 2);
    assert.strictEqual(greatArcDistance([-Math.PI / 4, 0], [Math.PI / 4, 0]), Math.PI / 2);

    // 从右向左穿过原点
    assert.strictEqual(greatArcDistance([Math.PI / 4, 0], [(7 * Math.PI) / 4, 0]), Math.PI / 2);
    assert.strictEqual(greatArcDistance([Math.PI / 4, 0], [-Math.PI / 4, 0]), Math.PI / 2);
  });
});

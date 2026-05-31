import assert from 'assert';
import { dasherize, deepEqual, deepmerge } from './misc';

describe('utils:misc:deepmerge', () => {
  it('应合并基础普通对象', () => {
    const one = { a: 'z', b: { c: { d: 'e' } } };
    const two = { b: { c: { f: 'g', j: 'i' } } };

    const result = deepmerge<any>(one, two);

    assert.deepStrictEqual(one, { a: 'z', b: { c: { d: 'e', f: 'g', j: 'i' } } });
    assert.strictEqual(result, one);
  });

  it('应通过替换合并数组', () => {
    const one = { a: [1, 2, 3] };
    const two = { a: [2, 4] };

    const result = deepmerge(one, two);

    assert.deepStrictEqual(one, { a: [2, 4] });
    assert.strictEqual(result, one);
  });

  it('应克隆对象', () => {
    const one = { b: { c: { d: 'e' } } };

    const result = deepmerge(null, one);

    assert.deepStrictEqual(result, { b: { c: { d: 'e' } } });
    assert.notStrictEqual(result, one);
    assert.notStrictEqual(result.b.c, one.b.c);
  });

  it('应克隆数组', () => {
    const one = [{ a: 'b' }, { c: 'd' }];

    const result = deepmerge(null, one);

    assert.deepStrictEqual(result, [{ a: 'b' }, { c: 'd' }]);
    assert.notStrictEqual(result[0], one[1]);
  });

  it('应接受原始值', () => {
    const one = 'foo';
    const two = 'bar';

    const result = deepmerge(one, two);

    assert.strictEqual(result, 'bar');
  });

  it('递归时应停止', () => {
    const one: any = { a: 'foo' };
    one.b = one;

    const result = deepmerge(null, one);

    assert.deepStrictEqual(result, { a: 'foo' });
  });

  it('应避免原型污染', () => {
    const payload = JSON.parse(`{
            "key1": "value",
            "__proto__": {"bad1": "foobar"},
            "key2": {"__proto__": {"bad2": "foobar"}}
        }`);

    const result = deepmerge({}, payload);

    assert.deepEqual(result.key1, 'value');
    assert.deepEqual(result.key2, {});
    assert.deepEqual(({} as any).bad1, undefined);
    assert.deepEqual(({} as any).bad2, undefined);
  });
});

describe('utils:misc:dasherize', () => {
  it('应将 camelCase 转为短横线写法', () => {
    assert.strictEqual(dasherize('strokeWidth'), 'stroke-width');
  });

  it('不应改变已有短横线写法', () => {
    assert.strictEqual(dasherize('stroke-width'), 'stroke-width');
  });
});

describe('utils:misc:deepEqual', () => {
  it('应比较简单对象', () => {
    assert.strictEqual(deepEqual({ foo: 'bar' }, { foo: 'bar' }), true);

    assert.strictEqual(deepEqual({ foo: 'bar' }, { foo: 'foo' }), false);

    assert.strictEqual(deepEqual({ foo: 'bar' }, { foo: 'bar', baz: 'bar' }), false);
  });

  it('应比较嵌套对象', () => {
    assert.strictEqual(deepEqual({ foo: { bar: 'baz' } }, { foo: { bar: 'baz' } }), true);

    assert.strictEqual(deepEqual({ foo: { bar: 'baz' } }, { foo: { bar: 'foo' } }), false);

    assert.strictEqual(deepEqual({ foo: { bar: 'baz' } }, { foo: { bar: 'baz', baz: 'bar' } }), false);
  });

  it('应比较数组', () => {
    assert.strictEqual(deepEqual({ foo: ['bar', 'baz'] }, { foo: ['bar', 'baz'] }), true);

    assert.strictEqual(deepEqual({ foo: ['bar', 'baz'] }, { foo: ['bar', 'bar'] }), false);
  });

  it('应比较标准类型', () => {
    assert.strictEqual(deepEqual({ a: 'foo', b: false, c: -4 }, { a: 'foo', b: false, c: -4 }), true);

    assert.strictEqual(deepEqual({ a: 'foo', b: false, c: -4 }, { a: 'foo', b: 'false', c: -4 }), false);

    assert.strictEqual(deepEqual({ a: 'foo', b: false, c: -4 }, { a: 'foo', b: false, c: '-4' }), false);
  });
});

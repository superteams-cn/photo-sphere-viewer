import assert from 'assert';
import { PanoData } from '../model';
import {
  cleanCssPosition,
  getConfigParser,
  getXMPValue,
  isExtendedPosition,
  mergePanoData,
  parseAngle,
  parsePoint,
  parseSpeed,
  speedToDuration,
} from './psv';

describe('utils:psv:isExtendedPosition', () => {
  it('应通过校验', () => {
    assert.strictEqual(isExtendedPosition({ pitch: 0, yaw: 0 }), true);
    assert.strictEqual(isExtendedPosition({ textureX: 0, textureY: 0 }), true);
    assert.strictEqual(isExtendedPosition({ pitch: 0, yaw: 0, textureX: 0, textureY: 0 }), true);
    assert.strictEqual(isExtendedPosition({ textureX: 0, textureY: 0, textureFace: 'front' }), true);
    assert.strictEqual(isExtendedPosition({ pitch: 0, yaw: 0, foo: { bar: 'baz' } }), true);
  });

  it('不应通过校验', () => {
    assert.strictEqual(isExtendedPosition(null), false);
    assert.strictEqual(isExtendedPosition({}), false);
    assert.strictEqual(isExtendedPosition([]), false);
    assert.strictEqual(isExtendedPosition({ pitch: 0 }), false);
    assert.strictEqual(isExtendedPosition({ textureX: 0 }), false);
  });
});

describe('utils:psv:parseAngle', () => {
  it('应规范化数字', () => {
    assert.strictEqual(parseAngle(0), 0, '0');
    assert.strictEqual(parseAngle(Math.PI), Math.PI, 'PI');
    assert.strictEqual(parseAngle(3 * Math.PI), Math.PI, '3xPI');

    assert.strictEqual(parseAngle(0, true), 0, '0 centered');
    assert.strictEqual(parseAngle((Math.PI * 3) / 4, true), Math.PI / 2, '3/4xPI centered');
    assert.strictEqual(parseAngle((-Math.PI * 3) / 4, true), -Math.PI / 2, '-3/4xPI centered');
  });

  it('应解析弧度角', () => {
    const values: Record<string, number> = {
      '0': 0,
      '1.72': 1.72,
      '-2.56': Math.PI * 2 - 2.56,
      '3.14rad': 3.14,
      '-3.14rad': Math.PI * 2 - 3.14,
    };

    for (const pos in values) {
      assert.strictEqual(parseAngle(pos).toFixed(16), values[pos].toFixed(16), pos);
    }
  });

  it('应解析角度值', () => {
    const values: Record<string, number> = {
      '0deg': 0,
      '30deg': (30 * Math.PI) / 180,
      '-30deg': Math.PI * 2 - (30 * Math.PI) / 180,
      '85degs': (85 * Math.PI) / 180,
      '360degs': 0,
    };

    for (const pos in values) {
      assert.strictEqual(parseAngle(pos).toFixed(16), values[pos].toFixed(16), pos);
    }
  });

  it('应将角度规范到 0 到 2π 之间', () => {
    const values: Record<string, number> = {
      '450deg': Math.PI / 2,
      '1440deg': 0,
      '8.15': 8.15 - Math.PI * 2,
      '-3.14': Math.PI * 2 - 3.14,
      '-360deg': 0,
    };

    for (const pos in values) {
      assert.strictEqual(parseAngle(pos).toFixed(16), values[pos].toFixed(16), pos);
    }
  });

  it('应将角度规范到 -π/2 到 π/2 之间', () => {
    const values: Record<string, number> = {
      '45deg': Math.PI / 4,
      '-4': Math.PI / 2,
    };

    for (const pos in values) {
      assert.strictEqual(parseAngle(pos, true).toFixed(16), values[pos].toFixed(16), pos);
    }
  });

  it('应将角度规范到 -π 到 π 之间', function () {
    const values: Record<string, number> = {
      '45deg': Math.PI / 4,
      '4': -2 * Math.PI + 4,
    };

    for (const pos in values) {
      assert.strictEqual(parseAngle(pos, true, false).toFixed(16), values[pos].toFixed(16), pos);
    }
  });

  it('应在数值无效时抛出异常', () => {
    assert.throws(
      () => {
        parseAngle('foobar');
      },
      /未知角度 "foobar"。/,
      'foobar',
    );

    assert.throws(
      () => {
        parseAngle('200gr');
      },
      /未知角度单位 "gr"。/,
      '200gr',
    );
  });
});

describe('utils:psv:parsePoint', () => {
  it('应解析两个关键字', () => {
    const values: Record<string, { x: number; y: number }> = {
      'top left': { x: 0, y: 0 },
      'top center': { x: 0.5, y: 0 },
      'top right': { x: 1, y: 0 },
      'center left': { x: 0, y: 0.5 },
      'center center': { x: 0.5, y: 0.5 },
      'center right': { x: 1, y: 0.5 },
      'bottom left': { x: 0, y: 1 },
      'bottom center': { x: 0.5, y: 1 },
      'bottom right': { x: 1, y: 1 },
    };

    for (const pos in values) {
      assert.deepStrictEqual(parsePoint(pos), values[pos], pos);

      const rev = pos.split(' ').reverse().join(' ');
      assert.deepStrictEqual(parsePoint(rev), values[pos], rev);
    }
  });

  it('应解析一个关键字', () => {
    const values: Record<string, { x: number; y: number }> = {
      top: { x: 0.5, y: 0 },
      center: { x: 0.5, y: 0.5 },
      bottom: { x: 0.5, y: 1 },
      left: { x: 0, y: 0.5 },
      right: { x: 1, y: 0.5 },
    };

    for (const pos in values) {
      assert.deepStrictEqual(parsePoint(pos), values[pos], pos);
    }
  });

  it('应解析两个百分比', () => {
    const values: Record<string, { x: number; y: number }> = {
      '0% 0%': { x: 0, y: 0 },
      '50% 50%': { x: 0.5, y: 0.5 },
      '100% 100%': { x: 1, y: 1 },
      '10% 80%': { x: 0.1, y: 0.8 },
      '80% 10%': { x: 0.8, y: 0.1 },
    };

    for (const pos in values) {
      assert.deepStrictEqual(parsePoint(pos), values[pos], pos);
    }
  });

  it('应解析一个百分比', () => {
    const values: Record<string, { x: number; y: number }> = {
      '0%': { x: 0, y: 0 },
      '50%': { x: 0.5, y: 0.5 },
      '100%': { x: 1, y: 1 },
      '80%': { x: 0.8, y: 0.8 },
    };

    for (const pos in values) {
      assert.deepStrictEqual(parsePoint(pos), values[pos], pos);
    }
  });

  it('应解析关键字与百分比混写', () => {
    const values: Record<string, { x: number; y: number }> = {
      'top 80%': { x: 0.8, y: 0 },
      '80% bottom': { x: 0.8, y: 1 },
      'left 40%': { x: 0, y: 0.4 },
      '40% right': { x: 1, y: 0.4 },
      'center 10%': { x: 0.5, y: 0.1 },
      '10% center': { x: 0.1, y: 0.5 },
    };

    for (const pos in values) {
      assert.deepStrictEqual(parsePoint(pos), values[pos], pos);
    }
  });

  it('解析失败时应回退', () => {
    const values: Record<string, { x: number; y: number }> = {
      '': { x: 0.5, y: 0.5 },
      crap: { x: 0.5, y: 0.5 },
      'foo bar': { x: 0.5, y: 0.5 },
      'foo 50%': { x: 0.5, y: 0.5 },
      '%': { x: 0.5, y: 0.5 },
    };

    for (const pos in values) {
      assert.deepStrictEqual(parsePoint(pos), values[pos], pos);
    }
  });

  it('应忽略多余片段', () => {
    const values: Record<string, { x: number; y: number }> = {
      'top center bottom': { x: 0.5, y: 0 },
      '50% left 20%': { x: 0, y: 0.5 },
      '0% 0% okay this time it goes ridiculous': { x: 0, y: 0 },
    };

    for (const pos in values) {
      assert.deepStrictEqual(parsePoint(pos), values[pos], pos);
    }
  });

  it('应忽略大小写', () => {
    const values: Record<string, { x: number; y: number }> = {
      'TOP CENTER': { x: 0.5, y: 0 },
      'cenTer LefT': { x: 0, y: 0.5 },
    };

    for (const pos in values) {
      assert.deepStrictEqual(parsePoint(pos), values[pos], pos);
    }
  });
});

describe('utils:psv:parseSpeed', () => {
  it('应解析所有单位', () => {
    const values: Record<string, number> = {
      '360dpm': (360 * Math.PI) / 180 / 60,
      '360degrees per minute': (360 * Math.PI) / 180 / 60,
      '10dps': (10 * Math.PI) / 180,
      '10degrees per second': (10 * Math.PI) / 180,
      '2radians per minute': 2 / 60,
      '0.1radians per second': 0.1,
      '2rpm': (2 * 2 * Math.PI) / 60,
      '2revolutions per minute': (2 * 2 * Math.PI) / 60,
      '0.01rps': 0.01 * 2 * Math.PI,
      '0.01revolutions per second': 0.01 * 2 * Math.PI,
    };

    for (const speed in values) {
      assert.strictEqual(parseSpeed(speed).toFixed(16), values[speed].toFixed(16), speed);
    }
  });

  it('应允许多种写法', () => {
    const values: Record<string, number> = {
      '2rpm': (2 * 2 * Math.PI) / 60,
      '2 rpm': (2 * 2 * Math.PI) / 60,
      '2revolutions per minute': (2 * 2 * Math.PI) / 60,
      '2 revolutions per minute': (2 * 2 * Math.PI) / 60,
      '-2rpm': (-2 * 2 * Math.PI) / 60,
      '-2 rpm': (-2 * 2 * Math.PI) / 60,
      '-2revolutions per minute': (-2 * 2 * Math.PI) / 60,
      '-2 revolutions per minute': (-2 * 2 * Math.PI) / 60,
    };

    for (const speed in values) {
      assert.strictEqual(parseSpeed(speed).toFixed(16), values[speed].toFixed(16), speed);
    }
  });

  it('应在单位无效时抛出异常', () => {
    assert.throws(
      () => {
        parseSpeed('10rpsec');
      },
      /未知速度单位 "rpsec"。/,
      '10rpsec',
    );
  });

  it('数值输入应直接透传', () => {
    assert.strictEqual(parseSpeed(Math.PI), Math.PI);
  });
});

describe('utils:psv:getXMPValue', () => {
  it('应解析带子节点的 XMP 数据', () => {
    const data = `
<rdf:Description rdf:about="" xmlns:GPano="http://ns.google.com/photos/1.0/panorama/">
      <GPano:ProjectionType>equirectangular</GPano:ProjectionType>
      <GPano:UsePanoramaViewer>True</GPano:UsePanoramaViewer>
      <GPano:CroppedAreaImageWidthPixels>5376</GPano:CroppedAreaImageWidthPixels>
      <GPano:CroppedAreaImageHeightPixels>2688</GPano:CroppedAreaImageHeightPixels>
      <GPano:FullPanoWidthPixels>5376</GPano:FullPanoWidthPixels>
      <GPano:FullPanoHeightPixels>2688</GPano:FullPanoHeightPixels>
      <GPano:CroppedAreaLeftPixels>0</GPano:CroppedAreaLeftPixels>
      <GPano:CroppedAreaTopPixels>0</GPano:CroppedAreaTopPixels>
      <GPano:PoseHeadingDegrees>270.0</GPano:PoseHeadingDegrees>
      <GPano:PosePitchDegrees>0</GPano:PosePitchDegrees>
      <GPano:PoseRollDegrees>0.2</GPano:PoseRollDegrees>
</rdf:Description>`;

    assert.deepStrictEqual(
      [
        getXMPValue(data, 'FullPanoWidthPixels'),
        getXMPValue(data, 'FullPanoHeightPixels'),
        getXMPValue(data, 'CroppedAreaImageWidthPixels'),
        getXMPValue(data, 'CroppedAreaImageHeightPixels'),
        getXMPValue(data, 'CroppedAreaLeftPixels'),
        getXMPValue(data, 'CroppedAreaTopPixels'),
        getXMPValue(data, 'PoseHeadingDegrees'),
        getXMPValue(data, 'PosePitchDegrees'),
        getXMPValue(data, 'PoseRollDegrees'),
      ],
      [5376, 2688, 5376, 2688, 0, 0, 270, 0, 0],
    );
  });

  it('应解析带属性的 XMP 数据', () => {
    const data = `
<rdf:Description rdf:about="" xmlns:GPano="http://ns.google.com/photos/1.0/panorama/"
    GPano:ProjectionType="equirectangular"
    GPano:UsePanoramaViewer="True"
    GPano:CroppedAreaImageWidthPixels="5376"
    GPano:CroppedAreaImageHeightPixels="2688"
    GPano:FullPanoWidthPixels="5376"
    GPano:FullPanoHeightPixels="2688"
    GPano:CroppedAreaLeftPixels="0"
    GPano:CroppedAreaTopPixels="0"
    GPano:PoseHeadingDegrees="270"
    GPano:PosePitchDegrees="0"
    GPano:PoseRollDegrees="0"/>`;

    assert.deepStrictEqual(
      [
        getXMPValue(data, 'FullPanoWidthPixels'),
        getXMPValue(data, 'FullPanoHeightPixels'),
        getXMPValue(data, 'CroppedAreaImageWidthPixels'),
        getXMPValue(data, 'CroppedAreaImageHeightPixels'),
        getXMPValue(data, 'CroppedAreaLeftPixels'),
        getXMPValue(data, 'CroppedAreaTopPixels'),
        getXMPValue(data, 'PoseHeadingDegrees'),
        getXMPValue(data, 'PosePitchDegrees'),
        getXMPValue(data, 'PoseRollDegrees'),
      ],
      [5376, 2688, 5376, 2688, 0, 0, 270, 0, 0],
    );
  });
});

describe('utils:psv:cleanPosition', () => {
  it('应清理多种格式', () => {
    assert.deepStrictEqual(cleanCssPosition('top right'), ['top', 'right']);
    assert.deepStrictEqual(cleanCssPosition('right top'), ['top', 'right']);
    assert.deepStrictEqual(cleanCssPosition(['top', 'right']), ['top', 'right']);
  });

  it('应补齐缺失的 center', () => {
    assert.deepStrictEqual(cleanCssPosition('top'), ['top', 'center']);
    assert.deepStrictEqual(cleanCssPosition('left'), ['center', 'left']);
    assert.deepStrictEqual(cleanCssPosition('center'), ['center', 'center']);
  });

  it('不应允许全部为 center', () => {
    assert.strictEqual(cleanCssPosition('center center', { allowCenter: false, cssOrder: true }), null);
    assert.strictEqual(cleanCssPosition('center', { allowCenter: false, cssOrder: true }), null);
  });

  it('无法解析时应返回 null', () => {
    assert.strictEqual(cleanCssPosition('foo bar'), null);
    assert.strictEqual(cleanCssPosition('TOP CENTER'), null);
    assert.strictEqual(cleanCssPosition(''), null);
    assert.strictEqual(cleanCssPosition(undefined as any), null);
  });

  it('应允许 XY 顺序', () => {
    assert.deepStrictEqual(cleanCssPosition('right top', { allowCenter: true, cssOrder: false }), ['right', 'top']);
    assert.deepStrictEqual(cleanCssPosition(['top', 'right'], { allowCenter: true, cssOrder: false }), [
      'top',
      'right',
    ]);
  });

  it('应始终按 center 规范排序', () => {
    assert.deepStrictEqual(cleanCssPosition('center top'), ['top', 'center']);
    assert.deepStrictEqual(cleanCssPosition('left center'), ['center', 'left']);
  });
});

describe('utils:psv:speedToDuration', () => {
  it('应原样返回数值', () => {
    assert.strictEqual(speedToDuration(1000, NaN), 1000);
    assert.strictEqual(speedToDuration(-1000, NaN), 1000);
  });

  it('应返回有效速度', () => {
    assert.strictEqual(speedToDuration('1rpm', Math.PI * 2), 60000);
    assert.strictEqual(speedToDuration('-1rpm', Math.PI * 2), 60000);
    assert.strictEqual(speedToDuration('2rpm', Math.PI), 15000);
  });
});

describe('utils:psv:mergePanoData', () => {
  it('应为 2:1 图片生成默认 panoData', () => {
    assertDeepEqualLenient(mergePanoData(2000, 1000), {
      fullWidth: 2000,
      fullHeight: 1000,
      croppedWidth: 2000,
      croppedHeight: 1000,
      croppedX: 0,
      croppedY: 0,
    } satisfies PanoData);
  });

  it('应为水平裁剪图片生成默认 panoData', () => {
    assertDeepEqualLenient(mergePanoData(2000, 500), {
      fullWidth: 2000,
      fullHeight: 1000,
      croppedWidth: 2000,
      croppedHeight: 500,
      croppedX: 0,
      croppedY: 250,
    } satisfies PanoData);
  });

  it('应为垂直裁剪图片生成默认 panoData', () => {
    assertDeepEqualLenient(mergePanoData(1000, 1000), {
      fullWidth: 2000,
      fullHeight: 1000,
      croppedWidth: 1000,
      croppedHeight: 1000,
      croppedX: 500,
      croppedY: 0,
    } satisfies PanoData);
  });

  it('应生成带姿态信息的默认 panoData', () => {
    assertDeepEqualLenient(
      mergePanoData(2000, 1000, {
        poseHeading: 90,
      } as PanoData),
      {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 2000,
        croppedHeight: 1000,
        croppedX: 0,
        croppedY: 0,
        poseHeading: 90,
      } satisfies PanoData,
    );
  });

  it('应保留 XMP 数据', () => {
    assertDeepEqualLenient(
      mergePanoData(2000, 500, undefined, {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 2000,
        croppedHeight: 500,
        croppedX: 0,
        croppedY: 500,
      }),
      {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 2000,
        croppedHeight: 500,
        croppedX: 0,
        croppedY: 500,
      } satisfies PanoData,
    );
  });

  it('自定义数据应覆盖 XMP 数据', () => {
    assertDeepEqualLenient(
      mergePanoData(
        2000,
        500,
        {
          fullWidth: 3000,
          fullHeight: 1500,
          croppedWidth: 2000,
          croppedHeight: 500,
          croppedX: 500,
          croppedY: 1000,
        },
        {
          fullWidth: 2000,
          fullHeight: 1000,
          croppedWidth: 2000,
          croppedHeight: 500,
          croppedX: 0,
          croppedY: 500,
        },
      ),
      {
        fullWidth: 3000,
        fullHeight: 1500,
        croppedWidth: 2000,
        croppedHeight: 500,
        croppedX: 500,
        croppedY: 1000,
      } satisfies PanoData,
    );
  });

  it('应修正无效的 fullWidth/fullHeight', () => {
    assertDeepEqualLenient(
      mergePanoData(2000, 500, {
        fullWidth: 2000,
        fullHeight: 990, // KO
        croppedWidth: 2000,
        croppedHeight: 500,
        croppedX: 0,
        croppedY: 500,
      }),
      {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 2000,
        croppedHeight: 500,
        croppedX: 0,
        croppedY: 500,
      } satisfies PanoData,
    );
  });

  it('应修正无效的 croppedY', () => {
    assertDeepEqualLenient(
      mergePanoData(2000, 500, {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 2000,
        croppedHeight: 500,
        croppedX: 0,
        croppedY: 1000, // KO
      }),
      {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 2000,
        croppedHeight: 500,
        croppedX: 0,
        croppedY: 500,
      } satisfies PanoData,
    );

    assertDeepEqualLenient(
      mergePanoData(2000, 500, {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 2000,
        croppedHeight: 500,
        croppedX: 0,
        croppedY: -500, // KO
      }),
      {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 2000,
        croppedHeight: 500,
        croppedX: 0,
        croppedY: 0,
      } satisfies PanoData,
    );
  });

  it('应修正无效的 croppedX', () => {
    assertDeepEqualLenient(
      mergePanoData(1000, 1000, {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 1000,
        croppedHeight: 1000,
        croppedX: 1500, // KO
        croppedY: 0,
      }),
      {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 1000,
        croppedHeight: 1000,
        croppedX: 1000,
        croppedY: 0,
      } satisfies PanoData,
    );

    assertDeepEqualLenient(
      mergePanoData(1000, 1000, {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 1000,
        croppedHeight: 1000,
        croppedX: -500, // KO
        croppedY: 0,
      }),
      {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 1000,
        croppedHeight: 1000,
        croppedX: 0,
        croppedY: 0,
      } satisfies PanoData,
    );
  });

  it('应补齐缺失的 fullWidth', () => {
    assertDeepEqualLenient(
      mergePanoData(1000, 1000, {
        fullHeight: 1000,
        croppedX: 500,
        croppedY: 0,
      } as PanoData),
      {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 1000,
        croppedHeight: 1000,
        croppedX: 500,
        croppedY: 0,
      },
    );
  });

  it('应补齐缺失的 fullHeight', () => {
    assertDeepEqualLenient(
      mergePanoData(1000, 1000, {
        fullWidth: 2000,
        croppedX: 500,
        croppedY: 0,
      }),
      {
        fullWidth: 2000,
        fullHeight: 1000,
        croppedWidth: 1000,
        croppedHeight: 1000,
        croppedX: 500,
        croppedY: 0,
      },
    );
  });

  it('图片较小时应同步缩放数据', () => {
    assertDeepEqualLenient(
      mergePanoData(8192, 4096, {
        fullWidth: 10000,
        fullHeight: 5000,
        croppedWidth: 10000,
        croppedHeight: 4000,
        croppedX: 0,
        croppedY: 500,
      } satisfies PanoData),
      {
        fullWidth: 8192,
        fullHeight: 4096,
        croppedWidth: 8192,
        croppedHeight: 3277,
        croppedX: 0,
        croppedY: 410,
      },
    );
  });
});

describe('utils:psv:getConfigParser', () => {
  type Myconfig = {
    field1?: string;
    field2?: number;
    field3?: boolean;
  };

  const parser = getConfigParser<Myconfig>({
    field1: 'default1',
    field2: 100,
    field3: true,
  });

  const parserWithParsers = getConfigParser<Myconfig>(
    {
      field1: 'default1',
      field2: 100,
      field3: true,
    },
    {
      field1(val, _) {
        return val.toUpperCase();
      },
      field2(val, opts) {
        return val + opts.defValue;
      },
      field3(_, opts) {
        return opts.rawConfig.field1 === 'foo';
      },
    },
  );

  it('应暴露默认值', () => {
    assert.deepStrictEqual(parser.defaults, {
      field1: 'default1',
      field2: 100,
      field3: true,
    });
  });

  it('应应用默认值', () => {
    assert.deepStrictEqual(parser(null), {
      field1: 'default1',
      field2: 100,
      field3: true,
    });
  });

  it('应定义普通值', () => {
    assert.deepStrictEqual(
      parser({
        field1: 'value1',
        field2: 0,
        field3: false,
      }),
      {
        field1: 'value1',
        field2: 0,
        field3: false,
      },
    );
  });

  it('应定义空值', () => {
    assert.deepStrictEqual(
      parser({
        field1: null,
        field2: null,
        field3: null,
      }),
      {
        field1: null,
        field2: null,
        field3: null,
      },
    );
  });

  it('应忽略未知字段', () => {
    assert.deepStrictEqual(
      parser({
        // @ts-ignore
        newField: 'foobar',
      }),
      {
        field1: 'default1',
        field2: 100,
        field3: true,
      },
    );
  });

  it('应应用解析器', () => {
    assert.deepStrictEqual(
      parserWithParsers({
        field1: 'foo',
        field2: 50,
        field3: false,
      }),
      {
        field1: 'FOO',
        field2: 150,
        field3: true,
      },
    );
  });
});

function assertDeepEqualLenient(actual: any, expected: any) {
  const picked = {} as any;
  Object.keys(expected).forEach((key) => {
    picked[key] = actual[key];
  });
  assert.deepStrictEqual(picked, expected);
}

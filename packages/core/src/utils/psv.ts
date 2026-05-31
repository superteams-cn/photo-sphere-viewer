import { Euler, LinearFilter, LinearMipmapLinearFilter, MathUtils, Quaternion, Texture, Vector3 } from 'three';
import { PSVError } from '../PSVError';
import { ExtendedPosition, PanoData, Point, ResolvableBoolean } from '../model';
import { getStyleProperty } from './browser';
import { wrap } from './math';
import { clone, firstNonNull, isPlainObject } from './misc';

/**
 * 用 ResolvableBoolean 解析出的值执行回调
 */
export function resolveBoolean(value: boolean | ResolvableBoolean, cb: (val: boolean, init: boolean) => void) {
  if (isPlainObject(value)) {
    cb((value as ResolvableBoolean).initial, true);
    (value as ResolvableBoolean).promise.then((res) => cb(res, false));
  } else {
    cb(value as boolean, true);
  }
}

/**
 * 反转 ResolvableBoolean 的解析结果
 */
export function invertResolvableBoolean(value: ResolvableBoolean): ResolvableBoolean {
  return {
    initial: !value.initial,
    promise: value.promise.then((res) => !res),
  };
}

/**
 * 构建名称为 'AbortError' 的 Error
 */
export function getAbortError(): Error {
  const error = new Error('加载已中止。');
  error.name = 'AbortError';
  return error;
}

/**
 * 判断 Error 的名称是否为 'AbortError'
 */
export function isAbortError(err: Error): boolean {
  return err?.name === 'AbortError';
}

/**
 * 在控制台显示带“全景图查看器”前缀的警告
 */
export function logWarn(message: string) {
  console.warn(`全景图查看器：${message}`);
}

/**
 * 判断对象是否为 ExtendedPosition，即是否包含 textureX/textureY 或 yaw/pitch
 */
export function isExtendedPosition(object: any): object is ExtendedPosition {
  if (!object || Array.isArray(object)) {
    return false;
  }
  return [
    ['textureX', 'textureY'],
    ['yaw', 'pitch'],
  ].some(([key1, key2]) => {
    return object[key1] !== undefined && object[key2] !== undefined;
  });
}

/**
 * 从全景图元数据中读取指定属性值
 */
export function getXMPValue(data: string, attr: string, intVal = true): number | null {
  // XMP data are stored in children
  let result = data.match('<GPano:' + attr + '>(.*)</GPano:' + attr + '>');
  if (result !== null) {
    const val = intVal ? parseInt(result[1], 10) : parseFloat(result[1]);
    return isNaN(val) ? null : val;
  }

  // XMP data are stored in attributes
  result = data.match('GPano:' + attr + '="(.*?)"');
  if (result !== null) {
    const val = intVal ? parseInt(result[1], 10) : parseFloat(result[1]);
    return isNaN(val) ? null : val;
  }

  return null;
}

const CSS_POSITIONS: Record<string, string> = {
  top: '0%',
  bottom: '100%',
  left: '0%',
  right: '100%',
  center: '50%',
};
const X_VALUES = ['left', 'center', 'right'];
const Y_VALUES = ['top', 'center', 'bottom'];
const POS_VALUES = [...X_VALUES, ...Y_VALUES];
const CENTER = 'center';

/**
 * 将 "top center" 或 "10% 50%" 等 CSS 值转换为 top/left 位置（0-1 范围）
 * 实现尽量贴近 "background-position" 规范
 * {@link https://developer.mozilla.org/en-US/docs/Web/CSS/background-position}
 */
export function parsePoint(value: string | Point): Point {
  if (!value) {
    return { x: 0.5, y: 0.5 };
  }

  if (typeof value === 'object') {
    return value;
  }

  let tokens = value.toLocaleLowerCase().split(' ').slice(0, 2);

  if (tokens.length === 1) {
    if (CSS_POSITIONS[tokens[0]]) {
      tokens = [tokens[0], CENTER];
    } else {
      tokens = [tokens[0], tokens[0]];
    }
  }

  const xFirst = tokens[1] !== 'left' && tokens[1] !== 'right' && tokens[0] !== 'top' && tokens[0] !== 'bottom';

  tokens = tokens.map((token) => CSS_POSITIONS[token] || token);

  if (!xFirst) {
    tokens.reverse();
  }

  const parsed = tokens.join(' ').match(/^([0-9.]+)% ([0-9.]+)%$/);

  if (parsed) {
    return {
      x: parseFloat(parsed[1]) / 100,
      y: parseFloat(parsed[2]) / 100,
    };
  } else {
    return { x: 0.5, y: 0.5 };
  }
}

/**
 * 将类 CSS 位置解析为 top、bottom、left、right、center 等位置关键字数组
 * @param value
 * @param [options]
 * @param [options.allowCenter=true] 允许 "center center"
 * @param [options.cssOrder=true] 强制使用 CSS 顺序（先 y 轴，再 x 轴）
 */
export function cleanCssPosition(
  value: string | string[],
  { allowCenter, cssOrder } = {
    allowCenter: true,
    cssOrder: true,
  },
): [string, string] | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    value = value.split(' ');
  }

  if (value.length === 1) {
    if (value[0] === CENTER) {
      value = [CENTER, CENTER];
    } else if (X_VALUES.indexOf(value[0]) !== -1) {
      value = [CENTER, value[0]];
    } else if (Y_VALUES.indexOf(value[0]) !== -1) {
      value = [value[0], CENTER];
    }
  }

  if (value.length !== 2 || POS_VALUES.indexOf(value[0]) === -1 || POS_VALUES.indexOf(value[1]) === -1) {
    logWarn(`Unparsable position ${value}`);
    return null;
  }

  if (!allowCenter && value[0] === CENTER && value[1] === CENTER) {
    logWarn(`Invalid position center center`);
    return null;
  }

  if (cssOrder && !cssPositionIsOrdered(value)) {
    value = [value[1], value[0]];
  }
  if (value[1] === CENTER && X_VALUES.indexOf(value[0]) !== -1) {
    value = [CENTER, value[0]];
  }
  if (value[0] === CENTER && Y_VALUES.indexOf(value[1]) !== -1) {
    value = [value[1], CENTER];
  }

  return value as [string, string];
}

/**
 * 检查两个位置组成的数组是否按顺序排列（先 y 轴，再 x 轴）
 */
export function cssPositionIsOrdered(value: string[]): boolean {
  return Y_VALUES.indexOf(value[0]) !== -1 && X_VALUES.indexOf(value[1]) !== -1;
}

/**
 * Parses an speed
 * @param speed in radians/degrees/revolutions per second/minute
 * @throws {@link PSVError} 速度无法解析时抛出
 */
export function parseSpeed(speed: string | number): number {
  let parsed;

  if (typeof speed === 'string') {
    const speedStr = speed.toString().trim();

    // Speed extraction
    let speedValue = parseFloat(speedStr.replace(/^(-?[0-9]+(?:\.[0-9]*)?).*$/, '$1'));
    const speedUnit = speedStr.replace(/^-?[0-9]+(?:\.[0-9]*)?(.*)$/, '$1').trim();

    // "per minute" -> "per second"
    if (speedUnit.match(/(pm|per minute)$/)) {
      speedValue /= 60;
    }

    // Which unit?
    switch (speedUnit) {
      // Degrees per minute / second
      case 'dpm':
      case 'degrees per minute':
      case 'dps':
      case 'degrees per second':
        parsed = MathUtils.degToRad(speedValue);
        break;

      // Radians per minute / second
      case 'rdpm':
      case 'radians per minute':
      case 'rdps':
      case 'radians per second':
        parsed = speedValue;
        break;

      // Revolutions per minute / second
      case 'rpm':
      case 'revolutions per minute':
      case 'rps':
      case 'revolutions per second':
        parsed = speedValue * Math.PI * 2;
        break;

      // Unknown unit
      default:
        throw new PSVError(`未知速度单位 "${speedUnit}"。`);
    }
  } else {
    parsed = speed;
  }

  return parsed;
}

/**
 * Converts a speed into a duration for a specific angle to travel
 */
export function speedToDuration(value: string | number, angle: number): number {
  if (typeof value !== 'number') {
    // desired radial speed
    const speed = parseSpeed(value);
    // compute duration
    return (angle / Math.abs(speed)) * 1000;
  } else {
    return Math.abs(value);
  }
}

/**
 * 解析弧度或角度形式的角度值，并返回归一化后的弧度值
 * @param angle - eg: 3.14, 3.14rad, 180deg
 * @param [zeroCenter=false] - normalize between -Pi - Pi instead of 0 - 2*Pi
 * @param [halfCircle=zeroCenter] - normalize between -Pi/2 - Pi/2 instead of -Pi - Pi
 * @throws {@link PSVError} 角度无法解析时抛出
 */
export function parseAngle(angle: string | number, zeroCenter = false, halfCircle = zeroCenter): number {
  let parsed;

  if (typeof angle === 'string') {
    const match = angle
      .toLowerCase()
      .trim()
      .match(/^(-?[0-9]+(?:\.[0-9]*)?)(.*)$/);

    if (!match) {
      throw new PSVError(`未知角度 "${angle}"。`);
    }

    const value = parseFloat(match[1]);
    const unit = match[2];

    if (unit) {
      switch (unit) {
        case 'deg':
        case 'degs':
          parsed = MathUtils.degToRad(value);
          break;
        case 'rad':
        case 'rads':
          parsed = value;
          break;
        default:
          throw new PSVError(`未知角度单位 "${unit}"。`);
      }
    } else {
      parsed = value;
    }
  } else if (typeof angle === 'number' && !isNaN(angle)) {
    parsed = angle;
  } else {
    throw new PSVError(`未知角度 "${angle}"。`);
  }

  parsed = wrap(zeroCenter ? parsed + Math.PI : parsed, Math.PI * 2);

  return zeroCenter
    ? MathUtils.clamp(parsed - Math.PI, -Math.PI / (halfCircle ? 2 : 1), Math.PI / (halfCircle ? 2 : 1))
    : parsed;
}

/**
 * 根据图片创建 THREE 纹理
 */
export function createTexture(img: TexImageSource, mimaps = false): Texture {
  const texture = new Texture(img);
  texture.needsUpdate = true;
  texture.minFilter = mimaps ? LinearMipmapLinearFilter : LinearFilter;
  texture.generateMipmaps = mimaps;
  texture.anisotropy = mimaps ? 2 : 1;
  return texture;
}

const quaternion = new Quaternion();

/**
 * 将欧拉角的逆变换应用到向量
 */
export function applyEulerInverse(vector: Vector3, euler: Euler) {
  quaternion.setFromEuler(euler).invert();
  vector.applyQuaternion(quaternion);
}

/**
 * 配置解析器声明，供 {@link getConfigParser} 使用
 */
export type ConfigParsers<T, U extends T = T> = {
  [key in keyof T]: (val: T[key], opts: { defValue: U[key]; rawConfig: T }) => U[key];
};

/**
 * {@link getConfigParser} 的结果
 */
export type ConfigParser<T, U extends T> = {
  (config: T): U;
  defaults: Required<U>;
  parsers: ConfigParsers<T, U>;
};

/**
 * 创建用于校验用户配置对象的函数
 *
 * @template T 输入配置类型
 * @template U 解析后的配置类型
 *
 * @param defaults 默认配置
 * @param parsers 用于解析和校验配置的函数
 *
 * @example
 * ```ts
 * type MyConfig = {
 *      value: number;
 *      label?: string;
 * };
 *
 * const getConfig<MyConfig>({
 *      value: 1,
 *      label: 'Title',
 * }, {
 *      value(value, { defValue }) {
 *          return value < 10 ? value : defValue;
 *      }
 * });
 *
 * const config = getConfig({ value: 3 });
 * ```
 */
export function getConfigParser<T extends Record<string, any>, U extends T = T>(
  defaults: Required<U>,
  parsers?: ConfigParsers<T, U>,
): ConfigParser<T, U> {
  const parser = function (userConfig: T): U {
    const rawConfig: U = clone({
      ...defaults,
      ...userConfig,
    });

    const config: U = {} as U;

    for (let [key, value] of Object.entries(rawConfig) as Array<[keyof T, any]>) {
      if (parsers && key in parsers) {
        value = parsers[key](value, {
          rawConfig: rawConfig,
          defValue: defaults[key],
        });
      } else if (!(key in defaults)) {
        logWarn(`未知选项 ${key as string}`);
        continue;
      }

      // @ts-ignore
      config[key] = value;
    }

    return config;
  } as ConfigParser<T, U>;

  parser.defaults = defaults;
  parser.parsers = parsers || ({} as any);

  return parser;
}

/**
 * 通过 CSS 变量是否存在判断样式表是否已加载
 */
export function checkStylesheet(element: HTMLElement, name: string) {
  if (getStyleProperty(element, `--psv-${name}-loaded`) !== 'true') {
    console.error(`全景图查看器：样式表 "@photo-sphere-viewer/${name}/index.css" 未加载`);
  }
}

/**
 * 检查依赖版本是否与 core 保持一致
 */
export function checkVersion(name: string, version: string, coreVersion: string) {
  if (version && version !== coreVersion) {
    console.error(
      `全景图查看器：@photo-sphere-viewer/${name} 的版本是 ${version}，但 @photo-sphere-viewer/core 的版本是 ${coreVersion}`,
    );
  }
}

/**
 * 检查查看器是否未被用于封闭的 shadow DOM 内
 */
export function checkClosedShadowDom(el: Node) {
  do {
    if (el instanceof ShadowRoot && el.mode === 'closed') {
      console.error(`全景图查看器：检测到封闭的 shadow DOM，查看器可能无法按预期工作`);
      return;
    }
    el = el.parentNode;
  } while (el);
}

/**
 * 合并 XMP 数据与自定义 panoData，并在数据缺失时应用默认行为
 */
export function mergePanoData(width: number, height: number, newPanoData?: PanoData, xmpPanoData?: PanoData): PanoData {
  const panoData: PanoData = {
    isEquirectangular: true,
    fullWidth: firstNonNull(newPanoData?.fullWidth, xmpPanoData?.fullWidth),
    fullHeight: firstNonNull(newPanoData?.fullHeight, xmpPanoData?.fullHeight),
    croppedWidth: firstNonNull(newPanoData?.croppedWidth, xmpPanoData?.croppedWidth, width),
    croppedHeight: firstNonNull(newPanoData?.croppedHeight, xmpPanoData?.croppedHeight, height),
    croppedX: firstNonNull(newPanoData?.croppedX, xmpPanoData?.croppedX),
    croppedY: firstNonNull(newPanoData?.croppedY, xmpPanoData?.croppedY),
    poseHeading: firstNonNull(newPanoData?.poseHeading, xmpPanoData?.poseHeading, 0),
    posePitch: firstNonNull(newPanoData?.posePitch, xmpPanoData?.posePitch, 0),
    poseRoll: firstNonNull(newPanoData?.poseRoll, xmpPanoData?.poseRoll, 0),
    initialHeading: xmpPanoData?.initialHeading,
    initialPitch: xmpPanoData?.initialPitch,
    initialFov: xmpPanoData?.initialFov,
  };

  // resize data if necessary
  if (panoData.croppedWidth !== width) {
    const ratio = width / panoData.croppedWidth;
    (
      ['fullWidth', 'fullHeight', 'croppedWidth', 'croppedHeight', 'croppedX', 'croppedY'] satisfies Array<
        keyof PanoData
      >
    ).forEach((key) => {
      if (panoData[key]) {
        panoData[key] = Math.round(panoData[key] * ratio);
      }
    });
  }

  // 补齐缺失数据
  if (!panoData.fullWidth && !panoData.fullHeight) {
    panoData.fullWidth = Math.max(panoData.croppedWidth, panoData.croppedHeight * 2);
    panoData.fullHeight = Math.round(panoData.fullWidth / 2);
  }
  if (!panoData.fullWidth) {
    panoData.fullWidth = panoData.fullHeight * 2;
  }
  if (!panoData.fullHeight) {
    panoData.fullHeight = Math.round(panoData.fullWidth / 2);
  }
  if (panoData.croppedX === null) {
    panoData.croppedX = Math.round((panoData.fullWidth - width) / 2);
  }
  if (panoData.croppedY === null) {
    panoData.croppedY = Math.round((panoData.fullHeight - height) / 2);
  }

  // sanity checks
  if (Math.abs(panoData.fullWidth - panoData.fullHeight * 2) > 1) {
    logWarn('无效的 panoData，fullWidth 应为 fullHeight 的两倍。');
    panoData.fullHeight = Math.round(panoData.fullWidth / 2);
  }
  if (panoData.croppedX + panoData.croppedWidth > panoData.fullWidth) {
    logWarn('无效的 panoData，croppedX + croppedWidth 大于 fullWidth。');
    panoData.croppedX = panoData.fullWidth - panoData.croppedWidth;
  }
  if (panoData.croppedY + panoData.croppedHeight > panoData.fullHeight) {
    logWarn('无效的 panoData，croppedY + croppedHeight 大于 fullHeight。');
    panoData.croppedY = panoData.fullHeight - panoData.croppedHeight;
  }
  if (panoData.croppedX < 0) {
    logWarn('无效的 panoData，croppedX 小于 0。');
    panoData.croppedX = 0;
  }
  if (panoData.croppedY < 0) {
    logWarn('无效的 panoData，croppedY 小于 0。');
    panoData.croppedY = 0;
  }

  return panoData;
}

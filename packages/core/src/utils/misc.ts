/**
 * Transforms a string to dash-case
 * @see https://github.com/shahata/dasherize
 */
export function dasherize(str: string): string {
  return str.replace(/[A-Z](?:(?=[^A-Z])|[A-Z]*(?=[A-Z][^A-Z]|$))/g, (s, i) => {
    return (i > 0 ? '-' : '') + s.toLowerCase();
  });
}

/**
 * 返回节流后的函数；在指定时间窗口内，该函数最多只会触发一次。
 */
export function throttle<T extends (...args: any) => any>(callback: T, wait: number): (...args: Parameters<T>) => void {
  let paused = false;
  return function (this: any, ...args: Parameters<T>) {
    if (!paused) {
      paused = true;
      setTimeout(() => {
        callback.apply(this, args);
        paused = false;
      }, wait);
    }
  };
}

/**
 * Test if an object is a plain object
 * 判断对象是否为普通对象，即由内置 Object 构造函数创建，
 * 并直接继承自 Object.prototype 或 null。
 * @see https://github.com/lodash/lodash/blob/master/isPlainObject.js
 */
export function isPlainObject<T extends Record<string, any>>(value: any): value is T {
  if (typeof value !== 'object' || value === null || Object.prototype.toString.call(value) !== '[object Object]') {
    return false;
  }
  if (Object.getPrototypeOf(value) === null) {
    return true;
  }
  let proto = value;
  while (Object.getPrototypeOf(proto) !== null) {
    proto = Object.getPrototypeOf(proto);
  }
  return Object.getPrototypeOf(value) === proto;
}

/**
 * 合并两个对象的可枚举属性。
 * 数组会被整体替换，目标对象会被就地修改。
 * @copyright Nicholas Fisher <nfisher110@gmail.com>
 */
export function deepmerge<T>(target: T, src: T): T {
  const first = src;

  return (function merge(target: any, src: any) {
    if (Array.isArray(src)) {
      if (!target || !Array.isArray(target)) {
        target = [];
      } else {
        target.length = 0;
      }
      src.forEach((e, i) => {
        target[i] = merge(null, e);
      });
    } else if (typeof src === 'object') {
      if (!target || Array.isArray(target)) {
        target = {};
      }
      Object.keys(src).forEach((key) => {
        if (key === '__proto__') {
          return;
        }
        if (typeof src[key] !== 'object' || !src[key] || !isPlainObject(src[key])) {
          target[key] = src[key];
        } else if (src[key] !== first) {
          if (!target[key]) {
            target[key] = merge(null, src[key]);
          } else {
            merge(target[key], src[key]);
          }
        }
      });
    } else {
      target = src;
    }

    return target;
  })(target, src);
}

/**
 * Deeply clones an object
 */
export function clone<T>(src: T): T {
  return deepmerge(null as T, src);
}

/**
 * Tests of an object is empty
 */
export function isEmpty(obj: any): boolean {
  return !obj || (Object.keys(obj).length === 0 && obj.constructor === Object);
}

/**
 * 判断值是否为 null 或 undefined
 */
export function isNil(val: any): val is null | undefined {
  return val === null || val === undefined;
}

/**
 * 返回第一个既非 null 也非 undefined 的参数
 */
export function firstNonNull<T>(...values: T[]): T | null {
  for (const val of values) {
    if (!isNil(val)) {
      return val;
    }
  }

  return null;
}

/**
 * 判断对象是否深度相等
 * @see https://gist.github.com/egardner/efd34f270cc33db67c0246e837689cb9
 */
export function deepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) {
    return true;
  } else if (isObject(obj1) && isObject(obj2)) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
      return false;
    }
    for (const prop of Object.keys(obj1)) {
      if (!deepEqual(obj1[prop], obj2[prop])) {
        return false;
      }
    }
    return true;
  } else {
    return false;
  }
}

function isObject(obj: any): boolean {
  return typeof obj === 'object' && obj !== null;
}

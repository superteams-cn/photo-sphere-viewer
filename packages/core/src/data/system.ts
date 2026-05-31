import { ResolvableBoolean } from '../model';
import { PSVError } from '../PSVError';
import { VIEWER_DATA } from './constants';

const LOCALSTORAGE_TOUCH_SUPPORT = `${VIEWER_DATA}_touchSupport`;

/**
 * 系统能力信息
 */
export const SYSTEM = {
  /**
   * 系统数据是否已加载
   */
  loaded: false,

  /**
   * 设备屏幕像素比
   */
  pixelRatio: 1,

  /**
   * 设备是否支持 WebGL
   */
  isWebGLSupported: false,

  /**
   * WebGL 最大纹理宽度
   */
  maxTextureWidth: 0,

  /**
   * 设备是否支持触摸事件
   */
  isTouchEnabled: null as ResolvableBoolean,

  /**
   * @internal
   */
  __maxCanvasWidth: null as number | null,

  /**
   * 当前设备是否为 iPhone
   */
  isIphone: false,

  /**
   * 最大 canvas 宽度
   */
  get maxCanvasWidth(): number {
    if (this.__maxCanvasWidth === null) {
      this.__maxCanvasWidth = getMaxCanvasWidth(this.maxTextureWidth);
    }
    return this.__maxCanvasWidth;
  },

  /**
   * 在系统信息尚未加载时加载它
   * @internal
   */
  load() {
    if (!this.loaded) {
      const ctx = getWebGLCtx();

      this.pixelRatio = window.devicePixelRatio || 1;
      this.isWebGLSupported = !!ctx;
      this.maxTextureWidth = ctx ? ctx.getParameter(ctx.MAX_TEXTURE_SIZE) : 0;
      this.isTouchEnabled = isTouchEnabled();
      this.isIphone = /iPhone/i.test(navigator.userAgent);
      this.loaded = true;
    }

    if (!SYSTEM.isWebGLSupported) {
      throw new PSVError('不支持 WebGL 2。');
    }
    if (SYSTEM.maxTextureWidth === 0) {
      throw new PSVError('无法检测系统能力。');
    }
  },
};

/**
 * 尝试返回 canvas WebGL 上下文
 */
function getWebGLCtx(): WebGLRenderingContext | null {
  try {
    const canvas = document.createElement('canvas');
    return canvas.getContext('webgl2');
  } catch {
    return null;
  }
}

/**
 * 检测用户是否正在使用触摸屏
 */
function isTouchEnabled(): ResolvableBoolean {
  let initial = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (LOCALSTORAGE_TOUCH_SUPPORT in localStorage) {
    initial = localStorage[LOCALSTORAGE_TOUCH_SUPPORT] === 'true';
  }

  const promise = new Promise<boolean>((resolve) => {
    const clear = () => {
      window.removeEventListener('mousedown', listenerMouse);
      window.removeEventListener('touchstart', listenerTouch);
      clearTimeout(listenerTimeoutId);
    };

    const listenerMouse = () => {
      clear();
      localStorage[LOCALSTORAGE_TOUCH_SUPPORT] = false;
      resolve(false);
    };

    const listenerTouch = () => {
      clear();
      localStorage[LOCALSTORAGE_TOUCH_SUPPORT] = true;
      resolve(true);
    };

    const listenerTimeout = () => {
      clear();
      localStorage[LOCALSTORAGE_TOUCH_SUPPORT] = initial;
      resolve(initial);
    };

    window.addEventListener('mousedown', listenerMouse, false);
    window.addEventListener('touchstart', listenerTouch, false);
    const listenerTimeoutId = setTimeout(listenerTimeout, 10000);
  });

  return { initial, promise };
}

/**
 * 获取浏览器支持的最大 canvas 宽度。
 * 仅测试 2 的幂，且高度等于宽度的一半，因为生成 WebGL 纹理只需要这种尺寸。
 * 改编自 https://github.com/jhildenbiddle/canvas-size
 */
function getMaxCanvasWidth(maxWidth: number): number {
  let width = maxWidth;
  let pass = false;

  // 使用 1x1 canvas 缩短 getImageData 完成时间
  const cropCanvas = document.createElement('canvas');
  const cropCtx = cropCanvas.getContext('2d');
  cropCanvas.width = 1;
  cropCanvas.height = 1;

  while (width > 1024 && !pass) {
    const testCanvas = document.createElement('canvas');
    const testCtx = testCanvas.getContext('2d');
    testCanvas.width = width;
    testCanvas.height = width / 2;

    try {
      testCtx.fillStyle = 'white';
      testCtx.fillRect(width - 1, width / 2 - 1, 1, 1);

      cropCtx.drawImage(testCanvas, width - 1, width / 2 - 1, 1, 1, 0, 0, 1, 1);

      if (cropCtx.getImageData(0, 0, 1, 1).data[0] > 0) {
        pass = true;
      }
    } catch {
      // 继续尝试
    }

    // 释放 canvas 元素（修复 Safari 内存占用）
    // https://stackoverflow.com/questions/52532614/total-canvas-memory-use-exceeds-the-maximum-limit-safari-12
    testCanvas.width = 0;
    testCanvas.height = 0;

    if (!pass) {
      width /= 2;
    }
  }

  if (pass) {
    return width;
  } else {
    throw new PSVError('无法检测系统能力。');
  }
}

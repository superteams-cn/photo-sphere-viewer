import arrow from '../icons/arrow.svg';
import close from '../icons/close.svg';
import download from '../icons/download.svg';
import fullscreenIn from '../icons/fullscreen-in.svg';
import fullscreenOut from '../icons/fullscreen-out.svg';
import info from '../icons/info.svg';
import menu from '../icons/menu.svg';
import zoomIn from '../icons/zoom-in.svg';
import zoomOut from '../icons/zoom-out.svg';

/**
 * {@link Viewer#animate} 创建动画的最短时长
 */
export const ANIMATION_MIN_DURATION = 500;

/**
 * 鼠标移动小于该像素数时视为点击
 */
export const MOVE_THRESHOLD = 4;

/**
 * 两次点击间隔小于该毫秒数时视为双击
 */
export const DBLCLICK_DELAY = 300;

/**
 * 模拟长按的延迟毫秒数
 */
export const LONGTOUCH_DELAY = 500;

/**
 * 双指提示覆盖层出现前的延迟毫秒数
 */
export const TWOFINGERSOVERLAY_DELAY = 100;

/**
 * “按住 Ctrl 缩放”覆盖层的显示时长（毫秒）
 */
export const CTRLZOOM_TIMEOUT = 2000;

/**
 * SphereGeometry 的半径，也是 BoxGeometry 的半边长
 */
export const SPHERE_RADIUS = 10;

/**
 * 添加到查看器元素上的属性名
 */
export const VIEWER_DATA = 'photoSphereViewer';

/**
 * 应用于特定元素的 CSS 类，用于阻止其鼠标事件冒泡到查看器本身
 */
export const CAPTURE_EVENTS_CLASS = 'psv--capture-event';

/**
 * {@link ViewerConfig['keyboardActions']} 配置可用的动作
 */
export enum ACTIONS {
  ROTATE_UP = 'ROTATE_UP',
  ROTATE_DOWN = 'ROTATE_DOWN',
  ROTATE_RIGHT = 'ROTATE_RIGHT',
  ROTATE_LEFT = 'ROTATE_LEFT',
  ZOOM_IN = 'ZOOM_IN',
  ZOOM_OUT = 'ZOOM_OUT',
}

/**
 * 各类内部标识符
 * @internal
 */
export const IDS = {
  MENU: 'menu',
  TWO_FINGERS: 'twoFingers',
  CTRL_ZOOM: 'ctrlZoom',
  ERROR: 'error',
  DESCRIPTION: 'description',
};

/**
 * 键盘按键代码子集
 */
export const KEY_CODES = {
  Enter: 'Enter',
  Control: 'Control',
  Escape: 'Escape',
  Space: ' ',
  PageUp: 'PageUp',
  PageDown: 'PageDown',
  ArrowLeft: 'ArrowLeft',
  ArrowUp: 'ArrowUp',
  ArrowRight: 'ArrowRight',
  ArrowDown: 'ArrowDown',
  Delete: 'Delete',
  Plus: '+',
  Minus: '-',
};

/**
 * SVG 图标集合
 */
export const ICONS = {
  arrow,
  close,
  download,
  fullscreenIn,
  fullscreenOut,
  info,
  menu,
  zoomIn,
  zoomOut,
};

/**
 * 缓动函数的字符串标识符
 */
export type EASING =
  | 'linear'
  | 'inQuad'
  | 'outQuad'
  | 'inOutQuad'
  | 'inCubic'
  | 'outCubic'
  | 'inOutCubic'
  | 'inQuart'
  | 'outQuart'
  | 'inOutQuart'
  | 'inQuint'
  | 'outQuint'
  | 'inOutQuint'
  | 'inSine'
  | 'outSine'
  | 'inOutSine'
  | 'inExpo'
  | 'outExpo'
  | 'inOutExpo'
  | 'inCirc'
  | 'outCirc'
  | 'inOutCirc';

/**
 * 缓动函数集合
 * @see https://gist.github.com/frederickk/6165768
 */
export const EASINGS: Record<EASING, (t: number) => number> = {
  linear: (t: number) => t,

  inQuad: (t: number) => t * t,
  outQuad: (t: number) => t * (2 - t),
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),

  inCubic: (t: number) => t * t * t,
  outCubic: (t: number) => --t * t * t + 1,
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1),

  inQuart: (t: number) => t * t * t * t,
  outQuart: (t: number) => 1 - --t * t * t * t,
  inOutQuart: (t: number) => (t < 0.5 ? 8 * t * t * t * t : 1 - 8 * --t * t * t * t),

  inQuint: (t: number) => t * t * t * t * t,
  outQuint: (t: number) => 1 + --t * t * t * t * t,
  inOutQuint: (t: number) => (t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * --t * t * t * t * t),

  inSine: (t: number) => 1 - Math.cos(t * (Math.PI / 2)),
  outSine: (t: number) => Math.sin(t * (Math.PI / 2)),
  inOutSine: (t: number) => 0.5 - 0.5 * Math.cos(Math.PI * t),

  inExpo: (t: number) => Math.pow(2, 10 * (t - 1)),
  outExpo: (t: number) => 1 - Math.pow(2, -10 * t),
  inOutExpo: (t: number) => ((t = t * 2 - 1) < 0 ? 0.5 * Math.pow(2, 10 * t) : 1 - 0.5 * Math.pow(2, -10 * t)),

  inCirc: (t: number) => 1 - Math.sqrt(1 - t * t),
  outCirc: (t: number) => Math.sqrt(1 - (t - 1) * (t - 1)),
  inOutCirc: (t: number) => ((t *= 2) < 1 ? 0.5 - 0.5 * Math.sqrt(1 - t * t) : 0.5 + 0.5 * Math.sqrt(1 - (t -= 2) * t)),
};

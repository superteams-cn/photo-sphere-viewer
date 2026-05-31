import { MathUtils } from 'three';
import { PSVError } from '../PSVError';
import { adapterInterop } from '../adapters/AbstractAdapter';
import { EquirectangularAdapter } from '../adapters/EquirectangularAdapter';
import { ParsedViewerConfig, ReadonlyViewerConfig, ViewerConfig } from '../model';
import { pluginInterop } from '../plugins/AbstractPlugin';
import { ConfigParsers, clone, getConfigParser, logWarn, parseAngle } from '../utils';
import { ACTIONS, KEY_CODES } from './constants';

/**
 * Default options
 */
export const DEFAULTS: Required<ParsedViewerConfig> = {
  panorama: null,
  container: null,
  adapter: [EquirectangularAdapter as any, null],
  plugins: [],
  caption: null,
  description: null,
  downloadUrl: null,
  downloadName: null,
  loadingImg: null,
  loadingTxt: '', // empty string => `lang.loading`
  size: null,
  fisheye: 0,
  minFov: 30,
  maxFov: 90,
  defaultZoomLvl: 50,
  defaultYaw: 0,
  defaultPitch: 0,
  sphereCorrection: null,
  moveSpeed: 1,
  zoomSpeed: 1,
  moveInertia: 0.8,
  mousewheel: true,
  mousemove: true,
  mousewheelCtrlKey: false,
  touchmoveTwoFingers: false,
  panoData: null,
  requestHeaders: null,
  canvasBackground: '#000',
  defaultTransition: {
    speed: 1500,
    rotation: true,
    effect: 'fade',
  },
  rendererParameters: { alpha: true, antialias: true },
  withCredentials: () => false,
  navbar: ['zoom', 'move', 'download', 'description', 'caption', 'fullscreen'],
  lang: {
    zoom: '缩放',
    zoomOut: '缩小',
    zoomIn: '放大',
    moveUp: '向上移动',
    moveDown: '向下移动',
    moveLeft: '向左移动',
    moveRight: '向右移动',
    description: '说明',
    download: '下载',
    fullscreen: '全屏',
    loading: '加载中...',
    menu: '菜单',
    close: '关闭',
    twoFingers: '请使用双指浏览',
    ctrlZoom: '请按住 Ctrl 并滚动来缩放图片',
    loadError: '全景图加载失败',
    webglError: '当前浏览器似乎不支持 WebGL',
  },
  keyboard: 'fullscreen',
  keyboardActions: {
    [KEY_CODES.ArrowUp]: ACTIONS.ROTATE_UP,
    [KEY_CODES.ArrowDown]: ACTIONS.ROTATE_DOWN,
    [KEY_CODES.ArrowRight]: ACTIONS.ROTATE_RIGHT,
    [KEY_CODES.ArrowLeft]: ACTIONS.ROTATE_LEFT,
    [KEY_CODES.PageUp]: ACTIONS.ZOOM_IN,
    [KEY_CODES.PageDown]: ACTIONS.ZOOM_OUT,
    [KEY_CODES.Plus]: ACTIONS.ZOOM_IN,
    [KEY_CODES.Minus]: ACTIONS.ZOOM_OUT,
  },
};

/**
 * List of unmodifiable options and their error messages
 * @internal
 */
export const READONLY_OPTIONS: Record<ReadonlyViewerConfig, string> = {
  panorama: 'Use setPanorama method to change the panorama',
  panoData: 'Use setPanorama method to change the panorama',
  container: 'Cannot change viewer container',
  adapter: 'Cannot change adapter',
  plugins: 'Cannot change plugins',
};

/**
 * Parsers/validators for each option
 * @internal
 */
export const CONFIG_PARSERS: ConfigParsers<ViewerConfig, ParsedViewerConfig> = {
  container: (container) => {
    if (!container) {
      throw new PSVError('No value given for container.');
    }
    return container;
  },
  adapter: (adapter, { defValue }) => {
    if (!adapter) {
      adapter = defValue;
    } else if (Array.isArray(adapter)) {
      adapter = [adapterInterop(adapter[0]), adapter[1]];
    } else {
      adapter = [adapterInterop(adapter), null];
    }
    if (!adapter[0]) {
      throw new PSVError('An undefined value was given for adapter.');
    }
    if (!(adapter[0] as any).id) {
      throw new PSVError(`Adapter has no id.`);
    }
    return adapter;
  },
  defaultYaw: (defaultYaw) => {
    // defaultYaw is between 0 and PI
    return parseAngle(defaultYaw);
  },
  defaultPitch: (defaultPitch) => {
    // defaultPitch is between -PI/2 and PI/2
    return parseAngle(defaultPitch, true);
  },
  defaultZoomLvl: (defaultZoomLvl) => {
    return MathUtils.clamp(defaultZoomLvl, 0, 100);
  },
  minFov: (minFov, { rawConfig }) => {
    // minFov and maxFov must be ordered
    if (rawConfig.maxFov < minFov) {
      logWarn('maxFov cannot be lower than minFov');
      minFov = rawConfig.maxFov;
    }
    // minFov between 1 and 179
    return MathUtils.clamp(minFov, 1, 179);
  },
  maxFov: (maxFov, { rawConfig }) => {
    // minFov and maxFov must be ordered
    if (maxFov < rawConfig.minFov) {
      maxFov = rawConfig.minFov;
    }
    // maxFov between 1 and 179
    return MathUtils.clamp(maxFov, 1, 179);
  },
  moveInertia: (moveInertia, { defValue }) => {
    if (moveInertia === true) {
      return defValue;
    }
    if (moveInertia === false) {
      return 0;
    }
    return moveInertia;
  },
  lang: (lang) => {
    return {
      ...DEFAULTS.lang,
      ...lang,
    };
  },
  fisheye: (fisheye) => {
    // translate boolean fisheye to amount
    if (fisheye === true) {
      return 1;
    } else if (fisheye === false) {
      return 0;
    }
    return fisheye;
  },
  requestHeaders: (requestHeaders) => {
    if (requestHeaders && typeof requestHeaders === 'object') {
      return () => requestHeaders;
    }
    if (typeof requestHeaders === 'function') {
      return requestHeaders;
    }
    return null;
  },
  withCredentials: (withCredentials) => {
    if (typeof withCredentials === 'boolean') {
      return () => withCredentials;
    }
    if (typeof withCredentials === 'function') {
      return withCredentials;
    }
    return () => false;
  },
  defaultTransition: (defaultTransition, { defValue }) => {
    if (defaultTransition === null || defaultTransition.speed === 0) {
      return null;
    } else {
      return { ...defValue, ...defaultTransition };
    }
  },
  rendererParameters: (rendererParameters, { defValue }) => ({
    ...rendererParameters,
    ...defValue,
  }),
  plugins: (plugins) => {
    return plugins.map((plugin, i) => {
      if (Array.isArray(plugin)) {
        plugin = [pluginInterop(plugin[0]), plugin[1]];
      } else {
        plugin = [pluginInterop(plugin), null];
      }
      if (!plugin[0]) {
        throw new PSVError(`An undefined value was given for plugin ${i}.`);
      }
      if (!(plugin[0] as any).id) {
        throw new PSVError(`Plugin ${i} has no id.`);
      }
      return plugin;
    });
  },
  navbar: (navbar) => {
    if (navbar === false) {
      return null;
    }
    if (navbar === true) {
      // true becomes the default array
      return clone(DEFAULTS.navbar as string[]);
    }
    if (typeof navbar === 'string') {
      // can be a space or coma separated list
      return navbar.split(/[ ,]/);
    }
    return navbar;
  },
};

/**
 * @internal
 */
export const getViewerConfig = getConfigParser<ViewerConfig, ParsedViewerConfig>(DEFAULTS, CONFIG_PARSERS);

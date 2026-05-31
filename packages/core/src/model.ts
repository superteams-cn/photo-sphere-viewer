import { Object3D, Texture, WebGLRendererParameters } from 'three';
import { AdapterConstructor } from './adapters/AbstractAdapter';
import { ACTIONS } from './data/constants';
import { PluginConstructor } from './plugins/AbstractPlugin';
import { Viewer } from './Viewer';
import { AnimationOptions } from './utils';

/**
 * Promise 包装对象，可在 Promise 完成前提供初始值
 */
export type ResolvableBoolean = { initial: boolean; promise: Promise<boolean> };

/**
 * 点坐标定义
 */
export type Point = {
  x: number;
  y: number;
};

/**
 * 尺寸定义
 */
export type Size = {
  width: number;
  height: number;
};

/**
 * CSS 尺寸定义
 */
export type CssSize = {
  width: string;
  height: string;
};

/**
 * 球面角度校正定义
 */
export type SphereCorrection<T = number | string> = {
  pan?: T;
  tilt?: T;
  roll?: T;
};

/**
 * 球面位置定义（弧度）
 */
export type Position = {
  yaw: number;
  pitch: number;
};

/**
 * 球面位置定义（弧度或角度）
 */
export type SphericalPosition = {
  yaw: number | string;
  pitch: number | string;
};

/**
 * 全景图图片上的位置定义（像素）
 */
export type PanoramaPosition = {
  textureX: number;
  textureY: number;
  textureFace?: string;
};

/**
 * 球面位置或全景图位置定义
 */
export type ExtendedPosition = SphericalPosition | PanoramaPosition;

/**
 * {@link Viewer.animate} 的选项定义
 */
export type AnimateOptions = Partial<ExtendedPosition> & {
  /**
   * 动画速度或持续时间（毫秒）
   */
  speed: string | number;
  /**
   * 新的缩放级别，范围为 0 到 100
   */
  zoom?: number;
  /**
   * 动画使用的缓动函数
   * @default 'inOutSine'
   */
  easing?: AnimationOptions<any>['easing'];
};

/**
 * 等距柱状全景图配置
 */
export type EquirectangularPanorama = {
  path: string;
  data?: PanoData | PanoDataProvider;
};

/**
 * 等距柱状全景图的裁剪信息
 */
export type PanoData = {
  isEquirectangular?: true;
  fullWidth: number;
  fullHeight?: number;
  croppedWidth?: number;
  croppedHeight?: number;
  croppedX: number;
  croppedY: number;
  poseHeading?: number;
  posePitch?: number;
  poseRoll?: number;
  /* @internal */
  initialHeading?: number;
  /* @internal */
  initialPitch?: number;
  /* @internal */
  initialFov?: number;
};

/**
 * 图片加载完成后计算全景图数据的函数
 */
export type PanoDataProvider = (image: HTMLImageElement, xmpData?: PanoData) => PanoData;

/**
 * {@link Viewer.setPanorama} 的选项定义
 */
export type PanoramaOptions = {
  /**
   * 新的全景图位置
   */
  position?: ExtendedPosition;
  /**
   * 新的导航栏标题
   */
  caption?: string;
  /**
   * 新的全景图说明
   */
  description?: string;
  /**
   * 新的缩放级别，范围为 0 到 100
   */
  zoom?: number;
  /**
   * 在新旧全景图之间启用过渡效果（旋转 + 淡入淡出）
   * @default true
   */
  transition?: boolean | TransitionOptions;
  /**
   * 加载新全景图时显示加载器
   * @default true
   */
  showLoader?: boolean;
  /**
   * 应用于全景图的新球面校正
   */
  sphereCorrection?: SphereCorrection;
  /**
   * 此全景图使用的新数据
   */
  panoData?: PanoData | PanoDataProvider;
};

export type TransitionOptions = {
  /** @default 1500 */
  speed?: string | number;
  /** @default true */
  rotation?: boolean;
  /** @default 'fade' */
  effect?: 'fade' | 'black' | 'white';
};

/**
 * {@link AbstractAdapter.loadTexture} 的结果
 */
export type TextureData<TTexture = Texture | Texture[] | Record<string, Texture>, TPanorama = any, TData = any> = {
  /**
   * 实际纹理或纹理列表
   */
  texture: TTexture;
  /**
   * 原始全景图定义
   */
  panorama: TPanorama;
  /**
   * 全景图元数据
   */
  panoData?: TData;
  /**
   * 加载器缓存使用的键
   */
  cacheKey?: string;
};

/**
 * {@link events.ClickEvent} 的数据
 */
export type ClickData = {
  /**
   * 是否为右键点击
   */
  rightclick: boolean;
  /**
   * 在浏览器窗口中的位置
   */
  clientX: number;
  /**
   * 在浏览器窗口中的位置
   */
  clientY: number;
  /**
   * 在查看器中的位置
   */
  viewerX: number;
  /**
   * 在查看器中的位置
   */
  viewerY: number;
  /**
   * 球面坐标中的位置
   */
  yaw: number;
  /**
   * 球面坐标中的位置
   */
  pitch: number;
  /**
   * 纹理上的位置（如适用）
   */
  textureX?: number;
  /**
   * 纹理上的位置（如适用）
   */
  textureY?: number;
  /**
   * 纹理上的位置（如适用）
   */
  textureFace?: string;
  /**
   * 接收点击的原始元素
   */
  target?: HTMLElement;
  /**
   * 触发点击的原始事件
   */
  originalEvent?: Event;
  /**
   * 鼠标下方的 THREE 场景对象列表
   */
  objects: Object3D[];
  /**
   * 被点击的标记
   */
  marker?: any;
};

/**
 * 导航栏按钮使用的自定义 Web Component 接口
 * @noInheritDoc
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface NavbarButtonElement extends HTMLElement {
  attachViewer?(viewer: Viewer): void;
}

/**
 * 自定义导航栏按钮定义
 */
export type NavbarCustomButton = {
  /**
   * 按钮的唯一标识符，调用 {@link Navbar.getButton} 方法时会用到
   */
  id?: string;
  /**
   * 鼠标悬停在按钮上时显示的提示文本
   * 也可以是全局 `lang` 配置中的键
   */
  title?: string;
  /**
   * 按钮内容，建议使用正方形图片或 SVG 图标
   */
  content: string | NavbarButtonElement;
  /**
   * 添加到按钮上的 CSS 类
   */
  className?: string;
  /**
   * 点击按钮时调用的函数
   */
  onClick?: (viewer: Viewer) => void;
  /**
   * 按钮的初始状态
   * @default false
   */
  disabled?: boolean;
  /**
   * 按钮的初始可见性
   * @default true
   */
  visible?: boolean;
  /**
   * if the button can be moved to menu when the navbar is too small
   * @default true
   */
  collapsable?: boolean;
  /**
   * if the button is accessible with the keyboard
   * @default true
   */
  tabbable?: boolean;
};

/**
 * Viewer configuration
 * @see https://photo-sphere-viewer.js.org/guide/config.html
 */
export type ViewerConfig = {
  container: HTMLElement | string;
  panorama?: any;
  /** @default equirectangular */
  adapter?: AdapterConstructor | [AdapterConstructor, any];
  plugins?: Array<PluginConstructor | [PluginConstructor, any]>;
  /** @default null */
  caption?: string;
  /** @default null */
  description?: string;
  /** @default null */
  downloadUrl?: string;
  /** @default null */
  downloadName?: string;
  /** @default null */
  loadingImg?: string;
  /** @default '加载中...' */
  loadingTxt?: string;
  /** @default `container` size */
  size?: CssSize;
  /** @default false */
  fisheye?: boolean | number;
  /** @default 30 */
  minFov?: number;
  /** @default 90 */
  maxFov?: number;
  /** @default 50 */
  defaultZoomLvl?: number;
  /** @default 0 */
  defaultYaw?: number | string;
  /** @default 0 */
  defaultPitch?: number | string;
  /** @default `0,0,0` */
  sphereCorrection?: SphereCorrection;
  /** @default 1 */
  moveSpeed?: number;
  /** @default 1 */
  zoomSpeed?: number;
  /** @default 0.8 */
  moveInertia?: boolean | number;
  /** @default true */
  mousewheel?: boolean;
  /** @default true */
  mousemove?: boolean;
  /** @default false */
  mousewheelCtrlKey?: boolean;
  /** @default false */
  touchmoveTwoFingers?: boolean;
  /** @default null */
  panoData?: PanoData | PanoDataProvider;
  /** @default null */
  requestHeaders?: Record<string, string> | ((url: string) => Record<string, string>);
  /** @default '#000' */
  canvasBackground?: string;
  /** @default '{ speed: 1500, rotation: true, effect: "fade" }' */
  defaultTransition?: TransitionOptions;
  /** @default '{ alpha: true, antialias: true }' */
  rendererParameters?: WebGLRendererParameters;
  /** @default false */
  withCredentials?: boolean | ((url: string) => boolean);
  /** @default 'zoom move download description caption fullscreen' */
  navbar?: boolean | string | Array<string | NavbarCustomButton>;
  lang?: Record<string, string>;
  /** @default 'fullscreen' */
  keyboard?: boolean | 'always' | 'fullscreen';
  keyboardActions?: Record<string, ACTIONS | ((viewer: Viewer, e: KeyboardEvent) => void)>;
};

/**
 * Viewer configuration after applying parsers
 */
export type ParsedViewerConfig = Omit<
  ViewerConfig,
  | 'adapter'
  | 'plugins'
  | 'defaultYaw'
  | 'defaultPitch'
  | 'moveInertia'
  | 'fisheye'
  | 'requestHeaders'
  | 'withCredentials'
  | 'navbar'
> & {
  adapter?: [AdapterConstructor, any];
  plugins?: Array<[PluginConstructor, any]>;
  defaultYaw?: number;
  defaultPitch?: number;
  moveInertia?: number;
  fisheye?: number;
  requestHeaders?: (url: string) => Record<string, string>;
  withCredentials?: (url: string) => boolean;
  navbar?: Array<string | NavbarCustomButton>;
};

/**
 * Readonly viewer configuration
 */
export type ReadonlyViewerConfig = 'panorama' | 'panoData' | 'container' | 'adapter' | 'plugins';

/**
 * Updatable viewer configuration
 */
export type UpdatableViewerConfig = Omit<ViewerConfig, ReadonlyViewerConfig>;

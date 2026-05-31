import type {
  ExtendedPosition,
  PanoramaPosition,
  Point,
  Position,
  Size,
  SphericalPosition,
} from '@photo-sphere-viewer/core';
import { ColorRepresentation } from 'three';
import type { Marker } from './markers/Marker';

/**
 * `element` 标记使用的自定义 Web Component 接口
 * @noInheritDoc
 */
// eslint-disable-next-line @typescript-eslint/consistent-type-definitions
export interface MarkerElement extends HTMLElement {
  updateMarker?(params: {
    marker: Marker;
    position: Point;
    viewerPosition: Position;
    zoomLevel: number;
    viewerSize: Size;
  }): void;
}

/**
 * 标记配置
 */
export type MarkerConfig = {
  /**
   * 图片路径
   */
  image?: string;
  /**
   * 图片路径
   */
  imageLayer?: string;
  /**
   * 视频路径
   */
  videoLayer?: string;
  /**
   * 标记的 HTML 内容
   */
  html?: string;
  /**
   * 已存在的 DOM 元素
   */
  element?: MarkerElement;
  /**
   * 已存在的 DOM 元素
   */
  elementLayer?: MarkerElement;
  /**
   * 正方形尺寸
   */
  square?: number;
  /**
   * 矩形尺寸
   */
  rect?: [number, number] | { width: number; height: number };
  /**
   * 圆形半径
   */
  circle?: number;
  /**
   * 椭圆半径
   */
  ellipse?: [number, number] | { rx: number; ry: number };
  /**
   * 路径定义
   */
  path?: string;
  /**
   * 以球面坐标定义多边形的点数组
   * 嵌套数组用于定义孔洞
   */
  polygon?:
    | Array<[number, number]>
    | Array<Array<[number, number]>>
    | Array<[string, string]>
    | Array<Array<[string, string]>>
    | SphericalPosition[]
    | SphericalPosition[][];
  /**
   * 以全景图像素坐标定义多边形的点数组
   * 嵌套数组用于定义孔洞
   */
  polygonPixels?: Array<[number, number]> | Array<Array<[number, number]>> | PanoramaPosition[] | PanoramaPosition[][];
  /**
   * 以球面坐标定义折线的点数组
   */
  polyline?: Array<[number, number]> | Array<[string, string]> | SphericalPosition[];
  /**
   * 以全景图像素坐标定义折线的点数组
   */
  polylinePixels?: Array<[number, number]> | PanoramaPosition[];

  /**
   * 标记的唯一标识符
   */
  id: string;
  /**
   * 标记位置（除 `polygon` 和 `polyline` 外必填）
   * 数组形式用于 `imageLayer` 和 `videoLayer`
   */
  position?: ExtendedPosition | [ExtendedPosition, ExtendedPosition, ExtendedPosition, ExtendedPosition];
  /**
   * 标记尺寸（`image` 必填，`html` 建议填写，其他类型会忽略）
   */
  size?: Size;
  /**
   * 应用于标记的旋转（`polygon` 和 `polyline` 会忽略）
   * 如果定义为单个数值，则应用到 `roll`（Z 轴）
   * 只有 3D 标记（`imageLayer`、`videoLayer`、`elementLayer`）支持 `yaw` 和 `pitch`
   */
  rotation?: string | number | { yaw?: number | string; pitch?: number | string; roll?: number | string };
  /**
   * 根据缩放级别和/或水平偏移配置标记缩放（`polygon`、`polyline`、`imageLayer`、`videoLayer` 会忽略）
   */
  scale?:
    | [number, number]
    | { zoom?: [number, number]; yaw?: [number, number] }
    | ((zoomLevel: number, position: Position) => number);
  /**
   * 覆盖全局 `defaultHoverScale`
   * @default null
   */
  hoverScale?: boolean | number | { amount?: number; duration?: number; easing?: string };
  /**
   * 标记透明度
   * @default 1
   */
  opacity?: number;
  /**
   * 绘制顺序
   * @default 1
   */
  zIndex?: number;
  /**
   * 添加到标记元素上的 CSS 类（`imageLayer`、`videoLayer` 会忽略）
   */
  className?: string;
  /**
   * 设置到标记上的 CSS 属性（背景、边框等；`imageLayer`、`videoLayer` 会忽略）
   */
  style?: Record<string, string>;
  /**
   * 设置到标记上的 SVG 属性（填充、描边等；仅适用于 SVG 标记）
   */
  svgStyle?: Record<string, string>;
  /**
   * 将图片/视频中的某种颜色设为透明（仅适用于 `imageLayer`、`videoLayer`）
   */
  chromaKey?: {
    /** @default false */
    enabled: boolean;
    /** @default 0x00ff00 */
    color?: ColorRepresentation | { r: number; g: number; b: number };
    /** @default 0.2 */
    similarity?: number;
    /** @default 0.2 */
    smoothness?: number;
  };
  /**
   * 定义标记相对于其位置的锚点
   * @default 'center center'
   */
  anchor?: string;
  /**
   * 调用 `gotoMarker()` 方法或在列表中点击标记时应用的缩放级别
   * @default `current zoom level`
   */
  zoomLvl?: number;
  /**
   * 标记的初始可见性
   * @default true
   */
  visible?: boolean;
  /**
   * 标记提示框配置
   * @default `{content: null, position: 'top center', className: null, trigger: 'hover'}`
   */
  tooltip?: string | { content: string; position?: string; className?: string; trigger?: 'hover' | 'click' };
  /**
   * 点击标记时在侧边面板中显示的 HTML 内容
   */
  content?: string;
  /**
   * 标记列表中显示的名称
   * @default `tooltip.content`
   */
  listContent?: string;
  /**
   * 在标记列表中隐藏此标记
   * @default false
   */
  hideList?: boolean;
  /**
   * `videoLayer` 标记是否自动播放
   * @default true
   */
  autoplay?: boolean;
  /**
   * 附加到标记上的任意自定义数据
   */
  data?: any;
};

export type ParsedMarkerConfig = Omit<MarkerConfig, 'rotation' | 'scale' | 'tooltip' | 'hoverScale'> & {
  rotation?: { yaw?: number; pitch?: number; roll?: number };
  scale?: { zoom?: [number, number]; yaw?: [number, number] } | ((zoomLevel: number, position: Position) => number);
  tooltip?: { content: string; position?: string; className?: string; trigger?: 'hover' | 'click' };
  hoverScale?: { amount: number; duration: number; easing: string };
};

export type MarkersPluginConfig = {
  /**
   * 是否在 `select-marker` 事件之外，同时在查看器上触发 `click` 事件
   * @default false
   */
  clickEventOnMarker?: boolean;
  /**
   * 初始标记
   */
  markers?: MarkerConfig[];
  /**
   * {@link MarkersPlugin#gotoMarker} 以及在列表/地图中点击标记时使用的默认动画速度
   * @default '8rpm'
   */
  gotoMarkerSpeed?: string | number;
  /**
   * 应用于所有标记的默认鼠标悬停缩放参数
   * (`true` = `{ amount: 2, duration: 100, easing: 'linear' }`)
   * @default null
   */
  defaultHoverScale?: boolean | number | { amount?: number; duration?: number; easing?: string };
};

export type ParsedMarkersPluginConfig = Omit<MarkersPluginConfig, 'defaultHoverScale'> & {
  defaultHoverScale?: { amount: number; duration: number; easing: string };
};

export type UpdatableMarkersPluginConfig = Omit<MarkersPluginConfig, 'markers'>;

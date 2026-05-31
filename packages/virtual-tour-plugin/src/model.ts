import type {
  ExtendedPosition,
  PanoData,
  PanoDataProvider,
  Point,
  Position,
  Size,
  SphereCorrection,
  TransitionOptions,
} from '@photo-sphere-viewer/core';
import type { MapHotspot } from '@photo-sphere-viewer/map-plugin';
import type { MarkerConfig } from '@photo-sphere-viewer/markers-plugin';
import type { PlanHotspot } from '@photo-sphere-viewer/plan-plugin';

/**
 * GPS 坐标定义（经度、纬度，可选高度）
 */
export type GpsPosition = [number, number, number?];

/**
 * 3D 模式下的箭头样式
 */
export type VirtualTourArrowStyle = {
  /**
   * 箭头使用的图片 URL
   */
  image?: string;
  /**
   * 为箭头使用自定义元素
   */
  element?: HTMLElement | ((link: VirtualTourLink) => HTMLElement);
  /**
   * 添加到元素上的 CSS 类
   */
  className?: string;
  /**
   * 箭头尺寸
   */
  size?: Size;
  /**
   * 设置到箭头上的 CSS 属性
   */
  style?: Record<string, string>;
};

/**
 * 节点之间的过渡行为
 */
export type VirtualTourTransitionOptions = {
  /**
   * 加载新全景图时显示加载器
   * @default true
   */
  showLoader?: boolean;
  /**
   * 启用节点之间的过渡效果
   * @default 'fade'
   */
  effect?: 'none' | TransitionOptions['effect'];
  /**
   * 节点过渡的速度或持续时间
   * @default '20rpm'
   */
  speed?: string | number;
  /**
   * 启用朝向下一个节点方向的旋转
   * @default true
   */
  rotation?: boolean;
  /**
   * 定义切换到下一个节点前当前全景图应旋转到的位置
   * 若未定义，将使用链接自身的位置
   */
  rotateTo?: Position;
  /**
   * 定义新的缩放级别
   * 若未定义，将保持当前缩放级别
   */
  zoomTo?: number;
};

/**
 * 两个节点之间的链接定义
 */
export type VirtualTourLink = Partial<ExtendedPosition> & {
  /**
   * 目标节点的标识符
   */
  nodeId: string;
  /**
   * 定义链接位置（手动模式）
   */
  position?: ExtendedPosition;
  /**
   * 添加到最终链接位置的偏移量，用于移动标记/箭头
   * 不影响进入下一个节点前查看器旋转到的位置
   */
  linkOffset?: { yaw?: number; pitch?: number; depth?: number };
  /**
   * 定义节点的 GPS 位置（GPS 模式）
   */
  gps?: [number, number, number?];
  /**
   * 覆盖全局箭头样式
   */
  arrowStyle?: VirtualTourArrowStyle;
  /**
   * 附加到链接上的任意自定义数据
   */
  data?: any;
};

/**
 * 导览中的单个节点定义
 */
export type VirtualTourNode = {
  id: string;
  panorama: any;
  /**
   * 节点短名称（用于链接提示框和图库）
   */
  name?: string;
  /**
   * 导航栏中显示的标题
   */
  caption?: string;
  /**
   * 侧边面板中显示的说明
   */
  description?: string;
  /**
   * 此全景图使用的数据
   */
  panoData?: PanoData | PanoDataProvider;
  /**
   * 应用于此全景图的球面校正
   */
  sphereCorrection?: SphereCorrection;
  /**
   * 指向其他节点的链接
   */
  links?: VirtualTourLink[];
  /**
   * GPS 位置
   */
  gps?: GpsPosition;
  /**
   * 在图库中显示此节点（如果已加载图库插件）
   * @default true
   */
  showInGallery?: boolean;
  /**
   * 图库使用的缩略图，也会用于提示框
   */
  thumbnail?: string;
  /**
   * 此节点上使用的额外标记
   */
  markers?: Array<MarkerConfig & { gps?: GpsPosition }>;
  /**
   * 使用地图插件时的热点配置
   * 设为 `false` 可在地图上隐藏此节点
   */
  map?: false | (Partial<Point> & Omit<MapHotspot, 'id' | 'yaw' | 'distance'>);
  /**
   * 使用平面图插件时的热点配置
   * 设为 `false` 可在平面图中隐藏此节点
   */
  plan?: false | Omit<PlanHotspot, 'id' | 'coordinates'>;
  /**
   * 附加到节点上的任意自定义数据
   */
  data?: any;
};

export type VirtualTourPluginConfig = {
  /**
   * 配置数据模式
   * @default 'client'
   */
  dataMode?: 'client' | 'server';
  /**
   * 配置定位模式
   * @default 'manual'
   */
  positionMode?: 'manual' | 'gps';
  /**
   * 配置链接渲染模式
   * @default '3d'
   */
  renderMode?: '3d' | '2d';
  /**
   * 初始节点（客户端模式）
   */
  nodes?: VirtualTourNode[];
  /**
   * 获取节点的函数（服务端模式）
   */
  getNode?: (nodeId: string) => VirtualTourNode | Promise<VirtualTourNode>;
  /**
   * 初始节点 id；未定义时使用第一个节点
   */
  startNodeId?: string;
  /**
   * 预加载链接的全景图
   */
  preload?: boolean | ((node: VirtualTourNode, link: VirtualTourLink) => boolean);
  /**
   * 节点之间的过渡配置，也可以是回调函数。
   * @default `{ showLoader: true, speed: '20rpm', effect: 'fade', rotation: true }`
   */
  transitionOptions?:
    | Pick<VirtualTourTransitionOptions, 'showLoader' | 'speed' | 'effect' | 'rotation'>
    | ((
        toNode: VirtualTourNode,
        fromNode?: VirtualTourNode,
        fromLink?: VirtualTourLink,
      ) => VirtualTourTransitionOptions);
  /**
   * 如果启用了指南针插件，则在指南针上显示链接
   * @default true
   */
  linksOnCompass?: boolean;
  /**
   * 在每个链接上显示提示框，默认包含“name” + “thumbnail” + “caption”
   * @default true
   */
  showLinkTooltip?: boolean;
  /**
   * 用于修改提示框内容的回调函数
   */
  getLinkTooltip?: (content: string, link: VirtualTourLink, node: VirtualTourNode) => string;
  /**
   * 全局箭头样式
   */
  arrowStyle?: VirtualTourArrowStyle;
  /**
   * 箭头容器配置
   */
  arrowsPosition?: {
    /**
     * (3D mode) Minimal vertical view angle
     * @default 0.3
     */
    minPitch?: number;
    /**
     * (3D mode) Maximal vertical view angle
     * @default PI/2
     */
    maxPitch?: number;
    /**
     * (3D mode) Make transparent links that are close to each other
     * @default PI/4
     */
    linkOverlapAngle?: number;
    /**
     * (2D+GPS mode) vertical offset applied to link markers, to compensate for viewer height
     * @default -0.1
     */
    linkPitchOffset?: number;
  };
  /**
   * special configuration when using the MapPlugin
   */
  map?: {
    /**
     * URL of the map
     */
    imageUrl: string;
    /**
     * size of the map in pixels
     */
    size?: Size;
    /**
     * bounds of the map in GPS coordinates (minX, minY, maxX, maxY)
     */
    extent?: [number, number, number, number];
    /**
     * automatically recenter the map when changing node
     */
    recenter?: boolean;
  };
};

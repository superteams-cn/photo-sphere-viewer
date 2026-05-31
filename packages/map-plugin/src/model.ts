import { Point } from '@photo-sphere-viewer/core';

export type MapHotspotStyle = {
  /**
   * 热点尺寸
   * @default 15
   */
  size?: number;
  /**
   * 热点使用的 SVG 或图片 URL
   */
  image?: string;
  /**
   * 未提供图片时热点使用的颜色
   * @default 'white'
   */
  color?: string;
  /**
   * 边框尺寸
   * @default 0
   */
  borderSize?: number;
  /**
   * 边框颜色
   * @default null
   */
  borderColor?: string;
  /**
   * 鼠标悬停时的尺寸
   * @default null
   */
  hoverSize?: number;
  /**
   * 鼠标悬停时使用的 SVG 或图片 URL
   * @default null
   */
  hoverImage?: string;
  /**
   * 鼠标悬停时的颜色
   * @default null
   */
  hoverColor?: string;
  /**
   * 鼠标悬停时的边框尺寸
   * @default 4
   */
  hoverBorderSize?: number;
  /**
   * 鼠标悬停时的边框颜色
   * @default 'rgba(255, 255, 255, 0.6)'
   */
  hoverBorderColor?: string;
  /**
   * 热点的堆叠顺序，默认按声明顺序排列
   * @default null
   */
  zIndex?: number;
};

export type MapHotspot = (Point | { yaw: number | string; distance: number }) &
  MapHotspotStyle & {
    /**
     * {@link MapPlugin.events.SelectHotspot | SelectHotspot} 事件使用的唯一标识符
     */
    id?: string;

    /**
     * 地图上显示的提示框
     */
    tooltip?: string | { content: string; className?: string };
  };

export type MapPluginConfig = {
  /**
   * 地图 URL
   */
  imageUrl?: string;

  /**
   * 全景图在地图上的位置
   */
  center?: Point;

  /**
   * 应用于图片的旋转
   * @default 0
   */
  rotation?: string | number;

  /**
   * @default 'round'
   */
  shape?: 'round' | 'square';

  /**
   * 地图尺寸
   * @default '200px'
   */
  size?: string;

  /**
   * 地图位置
   * @default 'bottom left'
   */
  position?: string | [string, string];

  /**
   * 加载第一张全景图时显示地图
   * @default true
   */
  visibleOnLoad?: boolean;

  /**
   * 绘制在地图上方的 SVG 或图片 URL（必须为正方形）
   */
  overlayImage?: string;

  /**
   * 中心图钉使用的 SVG 或图片 URL（必须为正方形）
   */
  pinImage?: string;

  /**
   * 中心图钉尺寸
   * @default 35
   */
  pinSize?: number;

  /**
   * 指南针视锥颜色
   * @default '#1E78E6'
   */
  coneColor?: string;

  /**
   * 指南针视锥尺寸
   * @default 40
   */
  coneSize?: number;

  /**
   * 热点默认样式
   */
  spotStyle?: MapHotspotStyle;

  /**
   * 固定地图，改为旋转图钉
   * @default false
   */
  static?: boolean;

  /**
   * 默认缩放级别
   * @default 100
   */
  defaultZoom?: number;

  /**
   * 最小缩放级别
   * @default 20
   */
  minZoom?: number;

  /**
   * 最大缩放级别
   * @default 200
   */
  maxZoom?: number;

  /**
   * 地图上的兴趣点
   */
  hotspots?: MapHotspot[];

  /**
   * 点击热点/标记时始终最小化地图
   */
  minimizeOnHotspotClick?: boolean;

  /**
   * 地图按钮配置
   */
  buttons?: {
    /** @default true */
    maximize?: boolean;
    /** @default true */
    close?: boolean;
    /** @default true */
    reset?: boolean;
    /** @default true */
    north?: boolean;
  };
};

export type ParsedMapPluginConfig = Omit<MapPluginConfig, 'position' | 'rotation'> & {
  position: [string, string];
  rotation: number;
};

export type UpdatableMapPluginConfig = Omit<MapPluginConfig, 'imageUrl' | 'visibleOnLoad' | 'defaultZoom' | 'buttons'>;

import { CssSize } from '@photo-sphere-viewer/core';
import type { Layer, Map } from 'leaflet';

/**
 * GPS 坐标定义（经度、纬度，可选高度）
 */
export type GpsPosition = [number, number, number?];

export type PlanHotspotStyle = {
  /**
   * Size of the hotspot
   * @default 15
   */
  size?: number;
  /**
   * SVG or image URL used for hotspot
   */
  image?: string;
  /**
   * Color of the hotspot when no image is provided
   * @default 'white'
   */
  color?: string;
  /**
   * Size of the border
   * @default 0
   */
  borderSize?: number;
  /**
   * Color of the border
   * @default null
   */
  borderColor?: string;
  /**
   * Size on mouse hover
   * @default null
   */
  hoverSize?: number;
  /**
   * SVG or image URL on mouse hover
   * @default null
   */
  hoverImage?: string;
  /**
   * Color on mouse hover
   * @default null
   */
  hoverColor?: string;
  /**
   * Size of the border on mouse hover
   * @default 4
   */
  hoverBorderSize?: number;
  /**
   * Color of the border on mouse hover
   * @default 'rgba(255, 255, 255, 0.8)'
   */
  hoverBorderColor?: string;
};

export type PlanHotspot = PlanHotspotStyle & {
  /**
   * 标记的 GPS 坐标
   */
  coordinates: GpsPosition;

  /**
   * {@link SelectHotspot} 事件使用的唯一标识符
   */
  id?: string;

  /**
   * 在平面图上显示的提示框
   */
  tooltip?: string | { content: string; className?: string };
};

export type PlanLayer = {
  urlTemplate?: string;
  layer?: Layer;
  name?: string;
  attribution?: string;
};

export type PlanPluginConfig = {
  /**
   * 当前全景图的 GPS 位置
   */
  coordinates?: GpsPosition;

  /**
   * Rotation offset to apply to the central pin
   * @default 0
   */
  bearing?: string | number;

  /**
   * 平面图尺寸
   * @default '300px * 200px'
   */
  size?: CssSize;

  /**
   * 平面图位置
   * @default 'bottom left'
   */
  position?: string | [string, string];

  /**
   * 加载第一张全景图时显示地图
   * @default true
   */
  visibleOnLoad?: boolean;

  /**
   * SVG or image URL used for the central pin (must be square)
   */
  pinImage?: string;

  /**
   * Size of the central pin
   * @default 35
   */
  pinSize?: number;

  /**
   * 热点默认样式
   */
  spotStyle?: PlanHotspotStyle;

  /**
   * 默认缩放级别
   * @default 15
   */
  defaultZoom?: number;

  /**
   * Define the available layers
   * @default OpenStreetMap
   */
  layers?: PlanLayer[];

  /**
   * Let you configure Leaflet from scratch
   */
  configureLeaflet?: (map: Map) => void;

  /**
   * 平面图上的兴趣点
   */
  hotspots?: PlanHotspot[];

  /**
   * 点击热点或标记时总是最小化平面图
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
  };
};

export type ParsedPlanPluginConfig = Omit<PlanPluginConfig, 'position' | 'bearing'> & {
  position: [string, string];
  bearing: number;
};

export type UpdatablePlanPluginConfig = Omit<
  PlanPluginConfig,
  'visibleOnLoad' | 'defaultZoom' | 'layers' | 'configureLeaflet' | 'buttons'
>;

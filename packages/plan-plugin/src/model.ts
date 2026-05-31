import { CssSize } from '@photo-sphere-viewer/core';
import type { Layer, Map } from 'leaflet';

/**
 * GPS 坐标定义（经度、纬度，可选高度）
 */
export type GpsPosition = [number, number, number?];

export type PlanHotspotStyle = {
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
   * {@link PlanPlugin.events.SelectHotspot | SelectHotspot} 事件使用的唯一标识符
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
   * 应用于中心图钉的旋转偏移
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
   * 中心图钉使用的 SVG 或图片 URL（必须为正方形）
   */
  pinImage?: string;

  /**
   * 中心图钉尺寸
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
   * 定义可用图层
   * @default OpenStreetMap
   */
  layers?: PlanLayer[];

  /**
   * 允许从零开始配置 Leaflet
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

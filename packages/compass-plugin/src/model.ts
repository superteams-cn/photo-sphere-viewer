import { ExtendedPosition } from '@photo-sphere-viewer/core';

export type CompassHotspot = ExtendedPosition & {
  /**
   * 覆盖全局 `hotspotColor`
   */
  color?: string;
};

export type CompassPluginConfig = {
  /**
   * 指南针尺寸
   * @default '120px'
   */
  size?: string;

  /**
   * 指南针位置
   * @default 'top left'
   */
  position?: string | [string, string];

  /**
   * 指南针背景使用的 SVG
   */
  backgroundSvg?: string;

  /**
   * 指南针视锥颜色
   * @default 'rgba(255, 255, 255, 0.5)'
   */
  coneColor?: string;

  /**
   * 是否允许点击指南针来旋转查看器
   * @default true
   */
  navigation?: boolean;

  /**
   * 使用指南针导航时，将查看器俯仰角重置为 `defaultPitch`
   * @default false
   */
  resetPitch?: boolean;

  /**
   * 导航视锥颜色
   * @default 'rgba(255, 0, 0, 0.2)'
   */
  navigationColor?: string;

  /**
   * 指南针上可见的小点（会包含所有带有 `compass` 数据的标记）
   */
  hotspots?: CompassHotspot[];

  /**
   * 热点默认颜色
   * @default 'rgba(0, 0, 0, 0.5)'
   */
  hotspotColor?: string;

  /**
   * 添加到指南针元素上的 CSS 类。
   */
  className?: string;
};

export type ParsedCompassPluginConfig = Omit<CompassPluginConfig, 'position'> & {
  position: [string, string];
};

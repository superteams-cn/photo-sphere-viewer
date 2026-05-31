import type { AdapterConstructor, PanoData, SphereCorrection } from '@photo-sphere-viewer/core';
import type { CubemapPanorama } from '@photo-sphere-viewer/cubemap-adapter';

export type BaseOverlayConfig = {
  id?: string;
  /**
   * @default 1
   */
  opacity?: number;
  /**
   * @default 0
   */
  zIndex?: number;
  /**
   * 应用于此覆盖层的球面校正。定义后会覆盖全局 inheritSphereCorrection 设置。
   */
  sphereCorrection?: SphereCorrection;
};

/**
 * 应用于球面的覆盖层，可为完整或局部球面
 */
export type SphereOverlayConfig = BaseOverlayConfig & {
  path: string;
  panoData?: PanoData;
};

/**
 * 应用于完整立方体的覆盖层（6 张图片）
 */
export type CubeOverlayConfig = BaseOverlayConfig & {
  path: CubemapPanorama;
};

export type OverlayConfig = SphereOverlayConfig | CubeOverlayConfig;

export type OverlaysPluginConfig = {
  /**
   * 初始覆盖层
   */
  overlays?: OverlayConfig[];
  /**
   * 全景图变化时自动移除所有覆盖层
   * @default true
   */
  autoclear?: boolean;
  /**
   * 将全局 `sphereCorrection` 应用于每个覆盖层
   * @default true
   */
  inheritSphereCorrection?: boolean;
  /**
   * 用于在等距柱状全景图上显示立方体覆盖层
   */
  cubemapAdapter?: AdapterConstructor;
};

export type UpdatableOverlaysPluginConfig = Omit<
  OverlaysPluginConfig,
  'overlays' | 'cubemapAdapter' | 'inheritSphereCorrection'
>;

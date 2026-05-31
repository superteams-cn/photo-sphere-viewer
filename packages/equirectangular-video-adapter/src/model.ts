import type { PanoData } from '@photo-sphere-viewer/core';
import type { AbstractVideoAdapterConfig, AbstractVideoPanorama } from '../../shared/AbstractVideoAdapter';

/**
 * 等距柱状视频配置
 */
export type EquirectangularVideoPanorama = AbstractVideoPanorama & {
  data?: PanoData | ((image: HTMLVideoElement) => PanoData);
};

export type EquirectangularVideoAdapterConfig = AbstractVideoAdapterConfig & {
  /**
   * 球体几何体面数；数值越大，性能开销可能越高
   * @default 64
   */
  resolution?: number;
};

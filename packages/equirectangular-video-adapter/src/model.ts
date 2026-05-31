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
   * number of faces of the sphere geometry, higher values may decrease performances
   * @default 64
   */
  resolution?: number;
};

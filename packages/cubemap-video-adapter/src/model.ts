import type { AbstractVideoAdapterConfig, AbstractVideoPanorama } from '../../shared/AbstractVideoAdapter';

/**
 * 立方体视频配置
 */
export type CubemapVideoPanorama = AbstractVideoPanorama & {
  /**
   * if the video is an equiangular cubemap (EAC)
   * @default true
   */
  equiangular?: boolean;
};

/**
 * Size information of a cubemap panorama
 */
export type CubemapVideoData = {
  isCubemap: true;
  equiangular: boolean;
};

export type CubemapVideoAdapterConfig = AbstractVideoAdapterConfig;

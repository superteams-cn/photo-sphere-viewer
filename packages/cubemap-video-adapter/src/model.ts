import type { AbstractVideoAdapterConfig, AbstractVideoPanorama } from '../../shared/AbstractVideoAdapter';

/**
 * 立方体视频配置
 */
export type CubemapVideoPanorama = AbstractVideoPanorama & {
  /**
   * 视频是否为等角立方体贴图（EAC）
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

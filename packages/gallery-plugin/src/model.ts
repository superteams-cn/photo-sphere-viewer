import type { PanoramaOptions, Size } from '@photo-sphere-viewer/core';

export type GalleryItem = {
  /**
   * 项目的唯一标识符
   */
  id: string | number;
  /**
   * 项目对应的全景图
   */
  panorama: any;
  /**
   * 缩略图 URL
   */
  thumbnail?: string;
  /**
   * 显示在缩略图上的文字
   */
  name?: string;
  /**
   * `setPanorama()` 方法支持的任意选项
   */
  options?: PanoramaOptions;
};

export type GalleryPluginConfig = {
  items?: GalleryItem[];
  /**
   * 显示用于浏览图库的箭头
   * @default true
   */
  navigationArrows?: boolean;
  /**
   * 加载第一张全景图时显示图库
   * @default false
   */
  visibleOnLoad?: boolean;
  /**
   * 用户点击项目后隐藏图库
   * @default true
   */
  hideOnClick?: boolean;
  /**
   * 缩略图尺寸
   * @default 200x100
   */
  thumbnailSize?: Size;
};

export type UpdatableGalleryPluginConfig = Omit<GalleryPluginConfig, 'items' | 'navigationArrows' | 'visibleOnLoad'>;

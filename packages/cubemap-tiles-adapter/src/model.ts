import type { Cubemap, CubemapAdapterConfig, CubemapData, CubemapPanorama } from '@photo-sphere-viewer/cubemap-adapter';

/**
 * 立方体瓦片配置
 */
export type CubemapTilesPanorama = {
  /**
   * 瓦片加载前显示的低分辨率全景图
   */
  baseUrl?: CubemapPanorama;
  /**
   * 单个面的像素尺寸
   */
  faceSize: number;
  /**
   * 单个面每边的瓦片数量
   */
  nbTiles: number;
  /**
   * 构建瓦片 URL 的函数
   */
  tileUrl: (face: keyof Cubemap, col: number, row: number) => string | null;
  /**
   * 如果顶面和底面方向不正确，请设为 true
   * @default false
   */
  flipTopBottom?: boolean;
};

export type CubemapTileLevel = {
  /**
   * @deprecated Not used anymore
   */
  zoomRange?: never;
  /**
   * 单个面的像素尺寸
   */
  faceSize: number;
  /**
   * 单个面每边的瓦片数量
   */
  nbTiles: number;
};

/**
 * 包含多级瓦片配置的立方体瓦片配置
 */
export type CubemapMultiTilesPanorama = {
  /**
   * 瓦片加载前显示的低分辨率全景图
   */
  baseUrl?: CubemapPanorama;
  /**
   * 按缩放级别划分的瓦片配置
   */
  levels: CubemapTileLevel[];
  /**
   * 构建瓦片 URL 的函数
   */
  tileUrl: (face: keyof Cubemap, col: number, row: number, level: number) => string | null;
  /**
   * 如果顶面和底面方向不正确，请设为 true
   * @default false
   */
  flipTopBottom?: boolean;
};

export type CubemapTilesAdapterConfig = CubemapAdapterConfig & {
  /**
   * 在无法加载的瓦片上显示警告标记
   * @default true
   */
  showErrorTile?: boolean;
  /**
   * 对低分辨率全景图应用模糊效果
   * @default true
   */
  baseBlur?: boolean;
  /**
   * 对高分辨率瓦片应用抗锯齿
   * @default true
   */
  antialias?: boolean;
  /**
   * 显示调试辅助信息
   * @default false
   * @internal
   */
  debug?: boolean;
};

export type CubemapTilesPanoData = CubemapData & {
  baseData: CubemapData;
};

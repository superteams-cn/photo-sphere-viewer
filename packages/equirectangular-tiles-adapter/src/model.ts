import type { EquirectangularAdapterConfig, PanoData, PanoDataProvider } from '@photo-sphere-viewer/core';

/**
 * 等距柱状瓦片全景图配置
 */
export type EquirectangularTilesPanorama = {
  /**
   * 瓦片加载前显示的低分辨率全景图
   */
  baseUrl?: string;
  /**
   * 与低分辨率全景图关联的 panoData 配置
   */
  basePanoData?: PanoData | PanoDataProvider;
  /**
   * 完整全景图宽度（高度始终为宽度的一半）
   */
  width: number;
  /**
   * 垂直方向瓦片数量（必须为 2 的幂）
   */
  cols: number;
  /**
   * 水平方向瓦片数量（必须为 2 的幂）
   */
  rows: number;
  /**
   * 构建瓦片 URL 的函数
   */
  tileUrl: (col: number, row: number) => string | null;
};

export type EquirectangularTileLevel = {
  /**
   * @deprecated Not used anymore
   */
  zoomRange?: never;
  /**
   * 完整全景图宽度（高度始终为宽度的一半）
   */
  width: number;
  /**
   * 垂直方向瓦片数量（必须为 2 的幂）
   */
  cols: number;
  /**
   * 水平方向瓦片数量（必须为 2 的幂）
   */
  rows: number;
};

/**
 * 包含多级瓦片配置的等距柱状全景图配置
 */
export type EquirectangularMultiTilesPanorama = {
  /**
   * 瓦片加载前显示的低分辨率全景图
   */
  baseUrl?: string;
  /**
   * 与低分辨率全景图关联的 panoData 配置
   */
  basePanoData?: PanoData | PanoDataProvider;
  /**
   * 按缩放级别划分的瓦片配置
   */
  levels: EquirectangularTileLevel[];
  /**
   * 构建瓦片 URL 的函数
   */
  tileUrl: (col: number, row: number, level: number) => string | null;
};

export type EquirectangularTilesAdapterConfig = Omit<EquirectangularAdapterConfig, 'interpolateBackground' | 'blur'> & {
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

export type EquirectangularTilesPanoData = PanoData & {
  baseData: PanoData;
};

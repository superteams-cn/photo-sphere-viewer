import type { PanoData, PanoDataProvider } from '@photo-sphere-viewer/core';

export type Resolution = {
  id: string;
  label: string;
  panorama: any;
  panoData?: PanoData | PanoDataProvider;
};

export type ResolutionPluginConfig = {
  /**
   * list of available resolutions
   */
  resolutions: Resolution[];
  /**
   * 查看器未配置全景图时使用的默认分辨率
   */
  defaultResolution?: string;
  /**
   * show the resolution id as a badge on the settings button
   * @default true
   */
  showBadge?: boolean;
};

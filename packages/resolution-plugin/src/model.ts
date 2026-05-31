import type { PanoData, PanoDataProvider } from '@photo-sphere-viewer/core';

export type Resolution = {
  id: string;
  label: string;
  panorama: any;
  panoData?: PanoData | PanoDataProvider;
};

export type ResolutionPluginConfig = {
  /**
   * 可用画质档位列表
   */
  resolutions: Resolution[];
  /**
   * 查看器未配置全景图时使用的默认画质档位
   */
  defaultResolution?: string;
  /**
   * 是否在设置按钮上以徽标形式显示画质档位 id
   * @default true
   */
  showBadge?: boolean;
};

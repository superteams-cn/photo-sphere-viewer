import { ExtendedPosition } from '@photo-sphere-viewer/core';

export type VideoKeypoint = {
  position: ExtendedPosition;
  time: number;
};

export type VideoPluginConfig = {
  /**
   * 在导航栏上方显示进度条
   * @default true
   */
  progressbar?: boolean;
  /**
   * 在查看器中央显示大型“播放”按钮
   * @default true
   */
  bigbutton?: boolean;
  /**
   * defines autorotate timed keypoints
   */
  keypoints?: VideoKeypoint[];
};

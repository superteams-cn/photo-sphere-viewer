import { ExtendedPosition } from '@photo-sphere-viewer/core';

/**
 * 自动旋转关键点定义，可以是位置对象、标记 id 或配置对象
 */
export type AutorotateKeypoint =
  | ExtendedPosition
  | string
  | {
      position?: ExtendedPosition;
      /**
       * 使用某个标记的位置和提示框
       */
      markerId?: string;
      /**
       * 到达此点时暂停动画；若存在提示框，则同时显示
       */
      pause?: number;
      /**
       * 可选提示框
       */
      tooltip?: string | { content: string; position?: string };
    };

export type AutorotatePluginConfig = {
  /**
   * 自动旋转开始前的延迟时间，单位为毫秒
   * @default 2000
   */
  autostartDelay?: number;
  /**
   * 用户空闲达到 `autostartDelay` 后重新开始自动旋转。
   * @default true
   */
  autostartOnIdle?: boolean;
  /**
   * 自动旋转速度。可使用负值反向旋转。
   * @default '2rpm'
   */
  autorotateSpeed?: string | number;
  /**
   * 执行自动旋转时使用的垂直角度。
   * @default 查看器的 `defaultPitch`
   */
  autorotatePitch?: number | string;
  /**
   * 执行自动旋转时使用的缩放级别。
   * @default 当前缩放级别
   */
  autorotateZoomLvl?: number;
  /**
   * List of positions to visit
   */
  keypoints?: AutorotateKeypoint[];
  /**
   * 从最近的关键点开始，而不是从第一个关键点开始
   * @default true
   */
  startFromClosest?: boolean;
};

export type UpdatableAutorotatePluginConfig = Omit<AutorotatePluginConfig, 'keypoints'>;

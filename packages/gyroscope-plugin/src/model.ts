export type GyroscopePluginConfig = {
  /**
   * 启用陀螺仪时允许水平平移（需要全局 `mousemove=true`）
   * @default true
   */
  touchmove?: boolean;
  /**
   * 应用相机滚转（沿 Z 轴旋转）
   * @default true
   */
  roll?: boolean;
  /**
   * 设为 true 时，启用陀螺仪控制会忽略当前朝向
   * @default false
   */
  absolutePosition?: boolean;
  /**
   * 陀螺仪数据驱动全景图旋转的方式
   * @default 'smooth'
   */
  moveMode?: 'smooth' | 'fast';
};

export type UpdatableGyroscopePluginConfig = Omit<GyroscopePluginConfig, 'absolutePosition'>;

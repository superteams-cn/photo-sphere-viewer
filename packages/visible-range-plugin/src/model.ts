export type Range = [number, number] | [string, string];

export type VisibleRangePluginConfig = {
  /**
   * horizontal range as two angles
   */
  horizontalRange?: Range;
  /**
   * vertical range as two angles
   */
  verticalRange?: Range;
  /**
   * 使用 {@link ViewerConfig panoData} 作为可视范围；也可以手动调用 {@link VisibleRangePlugin.setRangesFromPanoData}
   * @default false
   */
  usePanoData?: boolean;
};

export type UpdatableVisibleRangePluginConfig = Omit<VisibleRangePluginConfig, 'horizontalRange' | 'verticalRange'>;

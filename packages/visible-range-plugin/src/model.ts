export type Range = [number, number] | [string, string];

export type VisibleRangePluginConfig = {
  /**
   * 由两个角度表示的水平范围
   */
  horizontalRange?: Range;
  /**
   * 由两个角度表示的垂直范围
   */
  verticalRange?: Range;
  /**
   * 使用 {@link Core.ViewerConfig | ViewerConfig} 的 `panoData` 作为可视范围；也可以手动调用 {@link VisibleRangePlugin.setRangesFromPanoData}
   * @default false
   */
  usePanoData?: boolean;
};

export type UpdatableVisibleRangePluginConfig = Omit<VisibleRangePluginConfig, 'horizontalRange' | 'verticalRange'>;

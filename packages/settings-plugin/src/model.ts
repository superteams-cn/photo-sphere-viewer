/**
 * 设置项说明
 */
export type BaseSetting = {
  /**
   * 设置项标识符
   */
  id: string;
  /**
   * 设置项标签
   * 也可以是全局 `lang` 配置中的键
   */
  label: string;
  /**
   * 设置项类型
   */
  type: 'options' | 'toggle';
  /**
   * 返回按钮角标值的函数
   */
  badge?(): string;
};

/**
 * “选项”类设置说明
 */
export type OptionsSetting = BaseSetting & {
  type: 'options';
  /**
   * 返回当前选项 id 的函数
   */
  current(): string;
  /**
   * 返回可选项的函数
   */
  options(): SettingOption[];
  /**
   * 选择某个选项后调用的函数
   */
  apply(optionId: string): void;
};

/**
 * “开关”类设置说明
 */
export type ToggleSetting = BaseSetting & {
  type: 'toggle';
  /**
   * 返回设置项是否启用的函数
   */
  active(): boolean;
  /**
   * 切换设置项时调用的函数
   */
  toggle(): void;
};

/**
 * “选项”类设置的单个选项
 */
export type SettingOption = {
  /**
   * 选项标识符
   */
  id: string;
  /**
   * 选项标签
   * 也可以是全局 `lang` 配置中的键
   */
  label: string;
};

export type Setting = ToggleSetting | OptionsSetting;

export type SettingsPluginConfig = {
  /**
   * 是否跨会话保存设置
   * @default false
   */
  persist?: boolean;
  /**
   * 自定义存储处理器，默认使用 LocalStorage
   * @default LocalStorage
   */
  storage?: {
    set(settingId: string, value: boolean | string): void;
    /**
     * 如果选项不存在，返回 `undefined` 或 `null`
     */
    get(settingId: string): boolean | string | Promise<boolean> | Promise<string>;
  };
};

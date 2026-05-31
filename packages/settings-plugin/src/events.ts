import { TypedEvent } from '@photo-sphere-viewer/core';
import type { SettingsPlugin } from './SettingsPlugin';

/**
 * @event 设置值变化时触发
 */
export class SettingChangedEvent extends TypedEvent<SettingsPlugin> {
  static override readonly type = 'setting-changed';
  override type: 'setting-changed';

  /** @internal */
  constructor(
    public readonly settingId: string,
    public readonly settingValue: boolean | string,
  ) {
    super(SettingChangedEvent.type);
  }
}

export type SettingsPluginEvents = SettingChangedEvent;

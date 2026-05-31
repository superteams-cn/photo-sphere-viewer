import type { PluginConstructor, Viewer } from '@photo-sphere-viewer/core';
import { AbstractPlugin, events, PSVError, utils } from '@photo-sphere-viewer/core';
import type { OptionsSetting, SettingsPlugin } from '@photo-sphere-viewer/settings-plugin';
import { ResolutionChangedEvent, ResolutionPluginEvents } from './events';
import { Resolution, ResolutionPluginConfig } from './model';

const getConfig = utils.getConfigParser<ResolutionPluginConfig>({
  resolutions: null,
  defaultResolution: null,
  showBadge: true,
});

/**
 * 添加用于在多个全景图分辨率之间切换的设置项。
 */
export class ResolutionPlugin extends AbstractPlugin<ResolutionPluginEvents> {
  static override readonly id = 'resolution';
  static override readonly VERSION = PKG_VERSION;

  readonly config: ResolutionPluginConfig;

  private resolutions: Resolution[] = [];
  private resolutionsById: Record<string, Resolution> = {};

  private readonly state = {
    resolution: null as string,
  };

  private settings: SettingsPlugin;

  static withConfig(config: ResolutionPluginConfig): [PluginConstructor, any] {
    return [ResolutionPlugin, config];
  }

  constructor(viewer: Viewer, config: ResolutionPluginConfig) {
    super(viewer);

    this.config = getConfig(config);

    if (this.config.defaultResolution && this.viewer.config.panorama) {
      utils.logWarn(
        'ResolutionPlugin, a defaultResolution was provided ' +
          '但查看器已经配置了全景图，' +
          'defaultResolution 将被忽略。',
      );
    }
  }

  /**
   * @internal
   */
  override init() {
    super.init();

    this.settings = this.viewer.getPlugin('settings');

    if (!this.settings) {
      throw new PSVError('Resolution 插件需要配合 Settings 插件使用。');
    }

    this.settings.addSetting({
      id: ResolutionPlugin.id,
      type: 'options',
      label: ResolutionPlugin.id,
      current: () => this.state.resolution,
      options: () => this.resolutions,
      apply: (resolution) => this.__setResolutionIfExists(resolution),
      badge: !this.config.showBadge ? null : () => this.state.resolution,
    } as OptionsSetting);

    this.viewer.addEventListener(events.PanoramaLoadedEvent.type, this);

    if (this.config.resolutions) {
      this.setResolutions(this.config.resolutions, this.viewer.config.panorama ? null : this.config.defaultResolution);
      delete this.config.resolutions;
      delete this.config.defaultResolution;
    }
  }

  /**
   * @internal
   */
  override destroy() {
    this.viewer.removeEventListener(events.PanoramaLoadedEvent.type, this);

    this.settings.removeSetting(ResolutionPlugin.id);

    super.destroy();
  }

  /**
   * @internal
   */
  handleEvent(e: Event) {
    if (e instanceof events.PanoramaLoadedEvent) {
      this.__refreshResolution();
    }
  }

  /**
   * 修改可用分辨率
   * @param resolutions
   * @param defaultResolution - 如果未提供，则保留当前全景图
   * @throws {@link PSVError} 配置无效时抛出
   */
  setResolutions(resolutions: Resolution[], defaultResolution?: string) {
    this.resolutions = resolutions;
    this.resolutionsById = {};

    resolutions.forEach((resolution) => {
      if (!resolution.id) {
        throw new PSVError('缺少分辨率 id。');
      }
      if (!resolution.label) {
        throw new PSVError('缺少分辨率标签。');
      }
      if (!resolution.panorama) {
        throw new PSVError('缺少分辨率全景图。');
      }
      this.resolutionsById[resolution.id] = resolution;
    });

    // pick first resolution if no default provided and cannot find match with current panorama
    if (!defaultResolution) {
      if (this.viewer.config.panorama) {
        const resolution = this.resolutions.find((r) => utils.deepEqual(this.viewer.config.panorama, r.panorama));
        if (!resolution) {
          defaultResolution = resolutions[0].id;
        }
      } else {
        defaultResolution = resolutions[0].id;
      }
    }

    if (defaultResolution) {
      this.setResolution(defaultResolution);
    }

    this.__refreshResolution();
  }

  /**
   * 修改当前分辨率
   * @throws {@link PSVError} if the resolution does not exist
   */
  setResolution(id: string): Promise<unknown> {
    if (!this.resolutionsById[id]) {
      throw new PSVError(`未知分辨率 "${id}"。`);
    }

    return this.__setResolutionIfExists(id);
  }

  private __setResolutionIfExists(id: string): Promise<unknown> {
    if (this.resolutionsById[id]) {
      return this.viewer.setPanorama(this.resolutionsById[id].panorama, {
        transition: false,
        showLoader: false,
        panoData: this.resolutionsById[id].panoData,
      });
    } else {
      return Promise.resolve();
    }
  }

  /**
   * 返回当前分辨率
   */
  getResolution(): string {
    return this.state.resolution;
  }

  /**
   * Updates current resolution on panorama load
   */
  private __refreshResolution() {
    const resolution = this.resolutions.find((r) => utils.deepEqual(this.viewer.config.panorama, r.panorama));
    if (this.state.resolution !== resolution?.id) {
      this.state.resolution = resolution?.id;
      this.settings?.updateButton();
      this.dispatchEvent(new ResolutionChangedEvent(this.state.resolution));
    }
  }
}

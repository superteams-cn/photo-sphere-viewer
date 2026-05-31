import type { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import type { PanoData, PluginConstructor, Position, Viewer } from '@photo-sphere-viewer/core';
import { AbstractConfigurablePlugin, events, utils } from '@photo-sphere-viewer/core';
import { MathUtils } from 'three';
import { Range, UpdatableVisibleRangePluginConfig, VisibleRangePluginConfig } from './model';

type RangeResult = {
  rangedPosition: Position;
  sidesReached: Record<'top' | 'left' | 'bottom' | 'right', boolean>;
};

const EPS = 0.000001;

const getConfig = utils.getConfigParser<VisibleRangePluginConfig>({
  verticalRange: null,
  horizontalRange: null,
  usePanoData: false,
});

/**
 * 锁定可视角度范围
 */
export class VisibleRangePlugin extends AbstractConfigurablePlugin<
  VisibleRangePluginConfig,
  VisibleRangePluginConfig,
  UpdatableVisibleRangePluginConfig
> {
  static override readonly id = 'visible-range';
  static override readonly VERSION = PKG_VERSION;
  static override readonly configParser = getConfig;
  static override readonly readonlyOptions: Array<keyof VisibleRangePluginConfig> = [
    'horizontalRange',
    'verticalRange',
  ];

  private autorotate?: AutorotatePlugin;

  static withConfig(config: VisibleRangePluginConfig): [PluginConstructor, any] {
    return [VisibleRangePlugin, config];
  }

  constructor(viewer: Viewer, config: VisibleRangePluginConfig) {
    super(viewer, config);
  }

  /**
   * @internal
   */
  override init() {
    super.init();

    this.autorotate = this.viewer.getPlugin('autorotate');

    this.viewer.addEventListener(events.PanoramaLoadedEvent.type, this);
    this.viewer.addEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.addEventListener(events.ZoomUpdatedEvent.type, this);
    this.viewer.addEventListener(events.BeforeAnimateEvent.type, this);
    this.viewer.addEventListener(events.BeforeRotateEvent.type, this);

    this.setVerticalRange(this.config.verticalRange);
    this.setHorizontalRange(this.config.horizontalRange);
  }

  /**
   * @internal
   */
  override destroy() {
    this.viewer.removeEventListener(events.PanoramaLoadedEvent.type, this);
    this.viewer.removeEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.removeEventListener(events.ZoomUpdatedEvent.type, this);
    this.viewer.removeEventListener(events.BeforeAnimateEvent.type, this);
    this.viewer.removeEventListener(events.BeforeRotateEvent.type, this);

    super.destroy();
  }

  /**
   * @internal
   */
  handleEvent(e: Event) {
    switch (e.type) {
      case events.PanoramaLoadedEvent.type:
        if (this.config.usePanoData) {
          this.setRangesFromPanoData();
        } else {
          this.__moveToRange();
        }
        break;

      case events.BeforeRotateEvent.type:
      case events.BeforeAnimateEvent.type: {
        const e2 = e as events.BeforeAnimateEvent;
        const { rangedPosition, sidesReached } = this.__applyRanges(e2.position, e2.zoomLevel);
        if (e2.position || Object.keys(sidesReached).length) {
          // 仅在初始提供位置或位置已变化时重新定义
          e2.position = rangedPosition;
        }
        break;
      }

      case events.PositionUpdatedEvent.type: {
        const currentPosition = (e as events.PositionUpdatedEvent).position;
        const { sidesReached, rangedPosition } = this.__applyRanges(currentPosition);

        if ((sidesReached.left || sidesReached.right) && this.autorotate?.isEnabled()) {
          this.__reverseAutorotate(sidesReached.left, sidesReached.right);
        } else if (
          Math.abs(currentPosition.yaw - rangedPosition.yaw) > EPS ||
          Math.abs(currentPosition.pitch - rangedPosition.pitch) > EPS
        ) {
          this.viewer.dynamics.position.setValue(rangedPosition);
        }
        break;
      }

      case events.ZoomUpdatedEvent.type: {
        const currentPosition = this.viewer.getPosition();
        const { rangedPosition } = this.__applyRanges(currentPosition);

        if (
          Math.abs(currentPosition.yaw - rangedPosition.yaw) > EPS ||
          Math.abs(currentPosition.pitch - rangedPosition.pitch) > EPS
        ) {
          this.viewer.dynamics.position.setValue(rangedPosition);
        }
        break;
      }
    }
  }

  /**
   * 修改垂直范围
   */
  setVerticalRange(range: Range | null) {
    // 范围必须包含两个值
    if (range && range.length !== 2) {
      utils.logWarn('verticalRange 必须恰好包含两个元素。');
      range = null;
    }

    // 垂直范围位于 -PI/2 到 PI/2 之间
    if (range) {
      this.config.verticalRange = range.map((angle) => utils.parseAngle(angle, true)) as any;

      if (this.config.verticalRange[0] > this.config.verticalRange[1]) {
        utils.logWarn('verticalRange 的值必须按顺序排列。');
        this.config.verticalRange = [this.config.verticalRange[1], this.config.verticalRange[0]] as any;
      }

      if (this.viewer.state.ready) {
        this.__moveToRange();
      }
    } else {
      this.config.verticalRange = null;
    }
  }

  /**
   * 修改水平范围
   */
  setHorizontalRange(range: Range | null) {
    // 水平范围必须包含两个值
    if (range && range.length !== 2) {
      utils.logWarn('horizontalRange 必须恰好包含两个元素。');
      range = null;
    }

    // 水平范围位于 0 到 2*PI 之间
    if (range) {
      this.config.horizontalRange = range.map((angle) => utils.parseAngle(angle)) as any;

      if (this.viewer.state.ready) {
        this.__moveToRange();
      }
    } else {
      this.config.horizontalRange = null;
    }
  }

  /**
   * 根据当前全景图裁剪数据修改范围
   */
  setRangesFromPanoData() {
    const panoData = this.viewer.state.textureData.panoData as PanoData;
    if (panoData?.isEquirectangular) {
      this.setVerticalRange(this.__getPanoVerticalRange(panoData));
      this.setHorizontalRange(this.__getPanoHorizontalRange(panoData));
    }
  }

  /**
   * 获取查看器 panoData 定义的垂直范围
   */
  private __getPanoVerticalRange(p: PanoData): Range {
    if (p.croppedHeight === p.fullHeight) {
      return null;
    } else {
      const getAngle = (y: number) => Math.PI * (1 - y / p.fullHeight) - Math.PI / 2;
      return [getAngle(p.croppedY + p.croppedHeight), getAngle(p.croppedY)];
    }
  }

  /**
   * 获取查看器 panoData 定义的水平范围
   */
  private __getPanoHorizontalRange(p: PanoData): Range {
    if (p.croppedWidth === p.fullWidth) {
      return null;
    } else {
      const getAngle = (x: number) => 2 * Math.PI * (x / p.fullWidth) - Math.PI;
      return [getAngle(p.croppedX), getAngle(p.croppedX + p.croppedWidth)];
    }
  }

  /**
   * 立即移动查看器，使视角落入允许范围
   */
  private __moveToRange() {
    this.viewer.rotate(this.viewer.getPosition());
  }

  /**
   * 应用 "horizontalRange" 和 "verticalRange"
   */
  private __applyRanges(
    position: Position = this.viewer.getPosition(),
    zoomLevel: number = this.viewer.getZoomLevel(),
  ): RangeResult {
    const rangedPosition: Position = { yaw: position.yaw, pitch: position.pitch };
    const sidesReached: Record<string, true> = {};

    const vFov = this.viewer.dataHelper.zoomLevelToFov(zoomLevel);
    const hFov = this.viewer.dataHelper.vFovToHFov(vFov);

    if (this.config.horizontalRange) {
      const range = utils.clone(this.config.horizontalRange) as [number, number];
      const rangeFov = range[0] > range[1] ? range[1] + (2 * Math.PI - range[0]) : range[1] - range[0];

      // 对很窄的范围，将水平角锁定到中心
      if (rangeFov <= MathUtils.degToRad(hFov)) {
        range[0] = utils.parseAngle(range[0] + rangeFov / 2);
        range[1] = range[0];
      } else {
        const offset = MathUtils.degToRad(hFov) / 2;
        range[0] = utils.parseAngle(range[0] + offset);
        range[1] = utils.parseAngle(range[1] - offset);
      }

      if (range[0] > range[1]) {
        // 当范围跨过水平原点时
        if (position.yaw > range[1] && position.yaw < range[0]) {
          if (position.yaw > range[0] / 2 + range[1] / 2) {
            // 判断更接近哪一侧
            rangedPosition.yaw = range[0];
            sidesReached.left = true;
          } else {
            rangedPosition.yaw = range[1];
            sidesReached.right = true;
          }
        }
      } else if (position.yaw < range[0]) {
        rangedPosition.yaw = range[0];
        sidesReached.left = true;
      } else if (position.yaw > range[1]) {
        rangedPosition.yaw = range[1];
        sidesReached.right = true;
      }
    }

    if (this.config.verticalRange) {
      const range = utils.clone(this.config.verticalRange) as [number, number];
      const rangeFov = range[1] - range[0];

      // 对很窄的范围，将垂直角锁定到中心
      if (rangeFov <= MathUtils.degToRad(vFov)) {
        range[0] = utils.parseAngle(range[0] + rangeFov / 2, true);
        range[1] = range[0];
      } else {
        const offset = MathUtils.degToRad(vFov) / 2;
        range[0] = utils.parseAngle(range[0] + offset, true);
        range[1] = utils.parseAngle(range[1] - offset, true);
      }

      if (position.pitch < range[0]) {
        rangedPosition.pitch = range[0];
        sidesReached.bottom = true;
      } else if (position.pitch > range[1]) {
        rangedPosition.pitch = range[1];
        sidesReached.top = true;
      }
    }

    return { rangedPosition, sidesReached };
  }

  /**
   * 平滑反转自动旋转方向
   */
  private __reverseAutorotate(left: boolean, right: boolean) {
    // 已经在反转过程中
    if ((left && this.autorotate.config.autorotateSpeed > 0) || (right && this.autorotate.config.autorotateSpeed < 0)) {
      return;
    }

    this.autorotate.reverse();
  }
}

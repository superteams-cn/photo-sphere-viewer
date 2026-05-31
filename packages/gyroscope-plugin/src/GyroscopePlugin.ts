import type { PluginConstructor, Position, Viewer } from '@photo-sphere-viewer/core';
import { AbstractConfigurablePlugin, DEFAULTS, events, utils } from '@photo-sphere-viewer/core';
import { Object3D, Vector3 } from 'three';
import { DeviceOrientationControls } from './DeviceOrientationControls';
import { GyroscopePluginEvents, GyroscopeUpdatedEvent } from './events';
import { GyroscopePluginConfig, UpdatableGyroscopePluginConfig } from './model.js';

const getConfig = utils.getConfigParser<GyroscopePluginConfig>(
  {
    touchmove: true,
    roll: true,
    absolutePosition: false,
    moveMode: 'smooth',
  },
  {
    moveMode(moveMode, { defValue }) {
      if (moveMode !== 'smooth' && moveMode !== 'fast') {
        utils.logWarn(`陀螺仪插件：moveMode 无效`);
        return defValue;
      } else {
        return moveMode;
      }
    },
  },
);

const direction = new Vector3();

/**
 * 在移动设备上添加陀螺仪控制
 */
export class GyroscopePlugin extends AbstractConfigurablePlugin<
  GyroscopePluginConfig,
  GyroscopePluginConfig,
  UpdatableGyroscopePluginConfig,
  GyroscopePluginEvents
> {
  static override readonly id = 'gyroscope';
  static override readonly VERSION = PKG_VERSION;
  static override readonly configParser = getConfig;
  static override readonly readonlyOptions: Array<keyof GyroscopePluginConfig> = ['absolutePosition'];

  private readonly state = {
    isSupported: this.__checkSupport(),
    alphaOffset: 0,
    enabled: false,
    config_moveInertia: DEFAULTS.moveInertia,
    moveMode: this.config.moveMode,
  };

  private controls: DeviceOrientationControls;

  static withConfig(config: GyroscopePluginConfig): [PluginConstructor, any] {
    return [GyroscopePlugin, config];
  }

  constructor(viewer: Viewer, config: GyroscopePluginConfig) {
    super(viewer, config);
  }

  /**
   * @internal
   */
  override init() {
    super.init();

    this.viewer.addEventListener(events.StopAllEvent.type, this);
    this.viewer.addEventListener(events.BeforeRotateEvent.type, this);
    this.viewer.addEventListener(events.BeforeRenderEvent.type, this);
  }

  /**
   * @internal
   */
  override destroy() {
    this.viewer.removeEventListener(events.StopAllEvent.type, this);
    this.viewer.removeEventListener(events.BeforeRotateEvent.type, this);
    this.viewer.removeEventListener(events.BeforeRenderEvent.type, this);

    this.stop();

    this.controls?.disconnect();
    delete this.controls;

    super.destroy();
  }

  /**
   * @internal
   */
  handleEvent(e: Event) {
    if (e instanceof events.StopAllEvent) {
      this.stop();
    } else if (e instanceof events.BeforeRenderEvent) {
      this.__onBeforeRender();
    } else if (e instanceof events.BeforeRotateEvent) {
      this.__onBeforeRotate(e as events.BeforeRotateEvent);
    }
  }

  /**
   * 检查是否支持陀螺仪
   */
  isSupported(): Promise<boolean> {
    return this.state.isSupported;
  }

  /**
   * 检查陀螺仪是否已启用
   */
  isEnabled(): boolean {
    return this.state.enabled;
  }

  /**
   * 在可用时启用陀螺仪导航
   */
  start(moveMode = this.config.moveMode): Promise<void> {
    return this.state.isSupported
      .then((supported) => {
        if (supported) {
          return this.__requestPermission();
        } else {
          utils.logWarn('gyroscope not available');
          return Promise.reject();
        }
      })
      .then((granted) => {
        if (granted) {
          return Promise.resolve();
        } else {
          utils.logWarn('gyroscope not allowed');
          return Promise.reject();
        }
      })
      .then(() => {
        this.viewer.stopAll();

        this.state.moveMode = moveMode;

        // 禁用惯性
        this.state.config_moveInertia = this.viewer.config.moveInertia;
        this.viewer.config.moveInertia = 0;

        // 启用陀螺仪控制
        if (!this.controls) {
          this.controls = new DeviceOrientationControls(new Object3D(), this.config.absolutePosition);
        }

        // reset
        this.controls.alphaOffset = 0;

        this.state.alphaOffset = this.config.absolutePosition ? 0 : null;
        this.state.enabled = true;

        this.dispatchEvent(new GyroscopeUpdatedEvent(true));
      });
  }

  /**
   * 禁用陀螺仪导航
   */
  stop() {
    if (this.isEnabled()) {
      this.state.enabled = false;
      this.viewer.config.moveInertia = this.state.config_moveInertia;

      if (this.config.roll) {
        this.viewer.dynamics.roll.goto(0, 30);
      }

      this.dispatchEvent(new GyroscopeUpdatedEvent(false));

      this.viewer.resetIdleTimer();
    }
  }

  /**
   * 启用或禁用陀螺仪导航
   */
  toggle() {
    if (this.isEnabled()) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * 处理陀螺仪移动
   */
  private __onBeforeRender() {
    if (!this.isEnabled()) {
      return;
    }

    if (!this.controls.deviceOrientation) {
      return;
    }

    const position = this.viewer.getPosition();

    // 首次运行时，根据当前查看器位置和设备方向计算偏移量
    if (this.state.alphaOffset === null) {
      if (this.controls.update()) {
        this.controls.object.getWorldDirection(direction);

        const sphericalCoords = this.viewer.dataHelper.vector3ToSphericalCoords(direction);
        this.state.alphaOffset = sphericalCoords.yaw - position.yaw;
      }
    } else {
      this.controls.alphaOffset = this.state.alphaOffset;
      if (this.controls.update()) {
        this.controls.object.getWorldDirection(direction);

        const sphericalCoords = this.viewer.dataHelper.vector3ToSphericalCoords(direction);

        const target: Position = {
          yaw: sphericalCoords.yaw,
          pitch: -sphericalCoords.pitch,
        };

        // 小幅移动时放慢速度，可吸收设备或手部抖动
        const step = this.state.moveMode === 'smooth' ? 3 : 10;
        this.viewer.dynamics.position.goto(target, utils.getAngle(position, target) < 0.01 ? 1 : step);

        if (this.config.roll) {
          this.viewer.dynamics.roll.goto(-this.controls.object.rotation.z, this.state.moveMode === 'smooth' ? 10 : 30);
        }
      }
    }
  }

  /**
   * 拦截移动操作，并偏移 alpha 角
   */
  private __onBeforeRotate(e: events.BeforeRotateEvent) {
    if (this.isEnabled()) {
      e.preventDefault();

      if (this.config.touchmove) {
        this.state.alphaOffset -= e.position.yaw - this.viewer.getPosition().pitch;
      }
    }
  }

  /**
   * 检测是否支持设备方向
   */
  private __checkSupport(): Promise<boolean> {
    if ('DeviceOrientationEvent' in window && typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      return Promise.resolve(true);
    } else if ('DeviceOrientationEvent' in window) {
      return new Promise((resolve) => {
        const listener = (e: DeviceOrientationEvent) => {
          resolve(!!e && !utils.isNil(e.alpha) && !isNaN(e.alpha));

          window.removeEventListener('deviceorientation', listener);
        };

        window.addEventListener('deviceorientation', listener, false);
        setTimeout(listener, 10000);
      });
    } else {
      return Promise.resolve(false);
    }
  }

  /**
   * 请求运动传感器 API 权限
   */
  private __requestPermission(): Promise<boolean> {
    if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      return (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: string) => response === 'granted')
        .catch(() => false);
    } else {
      return Promise.resolve(true);
    }
  }
}

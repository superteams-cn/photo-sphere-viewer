import type { ExtendedPosition, PluginConstructor, Position, Tooltip, Viewer } from '@photo-sphere-viewer/core';
import { AbstractConfigurablePlugin, CONSTANTS, events, PSVError, utils } from '@photo-sphere-viewer/core';
import type { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import type { VideoPlugin } from '@photo-sphere-viewer/video-plugin';
import { MathUtils, SplineCurve, Vector2 } from 'three';
import { AutorotateEvent, AutorotatePluginEvents } from './events';
import { AutorotateKeypoint, AutorotatePluginConfig, UpdatableAutorotatePluginConfig } from './model';
// import { debugCurve } from '../../shared/autorotate-utils';

type ParsedAutorotatePluginConfig = Omit<AutorotatePluginConfig, 'autorotateSpeed' | 'autorotatePitch'> & {
  autorotateSpeed?: number;
  autorotatePitch?: number;
};

type AutorotateKeypointInternal = {
  position: [number, number];
  markerId: string;
  pause: number;
  tooltip: { content: string; position?: string };
};

const getConfig = utils.getConfigParser<AutorotatePluginConfig, ParsedAutorotatePluginConfig>(
  {
    autostartDelay: 2000,
    autostartOnIdle: true,
    autorotateSpeed: utils.parseSpeed('2rpm'),
    autorotatePitch: null,
    autorotateZoomLvl: null,
    keypoints: null,
    startFromClosest: true,
  },
  {
    autostartOnIdle: (autostartOnIdle, { rawConfig }) => {
      if (autostartOnIdle && utils.isNil(rawConfig.autostartDelay)) {
        utils.logWarn('autostartOnIdle 需要非空的 autostartDelay。');
        return false;
      }
      return autostartOnIdle;
    },
    autorotateSpeed: (autorotateSpeed) => {
      return utils.parseSpeed(autorotateSpeed);
    },
    autorotatePitch: (autorotatePitch) => {
      // autorotatePitch 位于 -PI/2 到 PI/2 之间
      if (!utils.isNil(autorotatePitch)) {
        return utils.parseAngle(autorotatePitch, true);
      }
      return null;
    },
    autorotateZoomLvl: (autorotateZoomLvl) => {
      if (!utils.isNil(autorotateZoomLvl)) {
        return MathUtils.clamp(autorotateZoomLvl, 0, 100);
      }
      return null;
    },
  },
);

const NUM_STEPS = 16;

function serializePt(position: Position): [number, number] {
  return [position.yaw, position.pitch];
}

/**
 * 为全景图添加自动旋转能力
 */
export class AutorotatePlugin extends AbstractConfigurablePlugin<
  AutorotatePluginConfig,
  ParsedAutorotatePluginConfig,
  UpdatableAutorotatePluginConfig,
  AutorotatePluginEvents
> {
  static override readonly id = 'autorotate';
  static override readonly VERSION = PKG_VERSION;
  static override readonly configParser = getConfig;
  static override readonly readonlyOptions: Array<keyof AutorotatePluginConfig> = ['keypoints'];

  private readonly state = {
    initialStart: true,
    disableOnIdle: false,
    /** 自动旋转是否已启用 */
    enabled: false,
    /** 当前关键点索引 */
    idx: -1,
    /** idx 与 idx + 1 之间的曲线 */
    curve: [] as Array<[number, number]>,
    /** 当前步骤的起点 */
    startStep: null as [number, number],
    /** 当前步骤的终点 */
    endStep: null as [number, number],
    /** 当前步骤的开始时间 */
    startTime: null as number,
    /** 当前步骤的预期时长 */
    stepDuration: null as number,
    /** 暂停剩余时间 */
    remainingPause: null as number,
    /** previous timestamp in render loop */
    lastTime: null as number,
    /** currently displayed tooltip */
    tooltip: null as Tooltip,
  };

  private keypoints: AutorotateKeypointInternal[];

  private video?: VideoPlugin;
  private markers?: MarkersPlugin;

  static withConfig(config: AutorotatePluginConfig): [PluginConstructor, any] {
    return [AutorotatePlugin, config];
  }

  constructor(viewer: Viewer, config: AutorotatePluginConfig) {
    super(viewer, config);

    this.state.initialStart = !utils.isNil(this.config.autostartDelay);
  }

  /**
   * @internal
   */
  override init() {
    super.init();

    this.video = this.viewer.getPlugin('video');
    this.markers = this.viewer.getPlugin('markers');

    if (this.config.keypoints) {
      this.setKeypoints(this.config.keypoints);
      delete this.config.keypoints;
    }

    this.viewer.addEventListener(events.StopAllEvent.type, this);
    this.viewer.addEventListener(events.BeforeRenderEvent.type, this);

    // 避免与 video 插件的播放/暂停逻辑冲突
    if (!this.video) {
      this.viewer.addEventListener(events.KeypressEvent.type, this);
    }
  }

  /**
   * @internal
   */
  override destroy() {
    this.viewer.removeEventListener(events.StopAllEvent.type, this);
    this.viewer.removeEventListener(events.BeforeRenderEvent.type, this);
    this.viewer.removeEventListener(events.KeypressEvent.type, this);

    delete this.video;
    delete this.markers;
    delete this.keypoints;

    super.destroy();
  }

  /**
   * @internal
   */
  handleEvent(e: Event) {
    switch (e.type) {
      case events.StopAllEvent.type:
        this.stop();
        break;

      case events.BeforeRenderEvent.type: {
        this.__beforeRender((e as events.BeforeRenderEvent).timestamp);
        break;
      }

      case events.KeypressEvent.type:
        this.__onKeyPress(e as events.KeypressEvent);
        break;
    }
  }

  /**
   * 修改关键点
   * @throws {@link Core.PSVError | PSVError} 配置无效时抛出
   */
  setKeypoints(keypoints: AutorotateKeypoint[] | null) {
    if (!keypoints) {
      this.keypoints = null;
    } else {
      if (keypoints.length < 2) {
        throw new PSVError('至少需要两个点。');
      }

      this.keypoints = keypoints.map((pt, i) => {
        const keypoint: AutorotateKeypointInternal = {
          position: null,
          markerId: null,
          pause: 0,
          tooltip: null,
        };

        let position: ExtendedPosition;

        if (typeof pt === 'string') {
          keypoint.markerId = pt;
        } else if (utils.isExtendedPosition(pt)) {
          position = pt;
        } else {
          keypoint.markerId = pt.markerId;
          keypoint.pause = pt.pause;
          position = pt.position;

          if (pt.tooltip && typeof pt.tooltip === 'object') {
            keypoint.tooltip = pt.tooltip;
          } else if (typeof pt.tooltip === 'string') {
            keypoint.tooltip = { content: pt.tooltip };
          }
        }

        if (keypoint.markerId) {
          if (!this.markers) {
            throw new PSVError(`关键点 #${i} 引用了标记，但尚未加载 markers 插件。`);
          }
          const marker = this.markers.getMarker(keypoint.markerId);
          keypoint.position = serializePt(marker.state.position);
        } else if (position) {
          keypoint.position = serializePt(this.viewer.dataHelper.cleanPosition(position));
        } else {
          throw new PSVError(`关键点 #${i} 缺少 marker 或 position。`);
        }

        return keypoint;
      });
    }

    if (this.isEnabled()) {
      this.stop();
      this.start();
    }
  }

  /**
   * 检查自动旋转是否已启用
   */
  isEnabled(): boolean {
    return this.state.enabled;
  }

  /**
   * 开始自动旋转
   */
  start() {
    if (this.isEnabled()) {
      return;
    }

    this.viewer.stopAll();

    if (!this.keypoints) {
      this.__animate();
    } else if (this.config.startFromClosest) {
      this.__shiftKeypoints();
    }

    this.state.initialStart = false;
    this.state.disableOnIdle = false;
    this.state.enabled = true;

    this.dispatchEvent(new AutorotateEvent(true));
  }

  /**
   * 停止自动旋转
   */
  stop() {
    if (!this.isEnabled()) {
      return;
    }

    this.__hideTooltip();
    this.__reset();

    this.viewer.stopAnimation();
    this.viewer.dynamics.position.stop();
    this.viewer.dynamics.zoom.stop();

    this.state.enabled = false;

    this.dispatchEvent(new AutorotateEvent(false));
  }

  /**
   * 开始或停止自动旋转
   */
  toggle() {
    if (this.isEnabled()) {
      this.stop();
    } else {
      this.start();
    }
  }

  /**
   * @internal
   */
  reverse() {
    if (this.isEnabled() && !this.keypoints) {
      this.config.autorotateSpeed = -this.config.autorotateSpeed;
      this.__animate();
    }
  }

  /**
   * @internal
   */
  disableOnIdle() {
    this.state.disableOnIdle = true;
  }

  /**
   * 启动标准动画
   */
  private __animate() {
    // 先缩放，再旋转
    let p: PromiseLike<any>;
    if (!utils.isNil(this.config.autorotateZoomLvl)) {
      p = this.viewer.animate({
        zoom: this.config.autorotateZoomLvl,
        // "2" 是经验系数，与 getAnimationProperties() 中的 "PI/4" 有关
        speed: `${this.viewer.config.zoomSpeed * 2}rpm`,
      });
    } else {
      p = Promise.resolve(true);
    }

    p.then((done) => {
      if (done) {
        this.viewer.dynamics.position.roll(
          {
            yaw: this.config.autorotateSpeed < 0,
          },
          Math.abs(this.config.autorotateSpeed / this.viewer.config.moveSpeed),
        );

        if (!utils.isNil(this.config.autorotatePitch)) {
          this.viewer.dynamics.position.goto(
            {
              pitch: this.config.autorotatePitch,
            },
            Math.abs(this.config.autorotateSpeed / this.viewer.config.moveSpeed),
          );
        }
      }
    });
  }

  /**
   * 重置所有曲线变量
   */
  private __reset() {
    this.state.idx = -1;
    this.state.curve = [];
    this.state.startStep = null;
    this.state.endStep = null;
    this.state.startTime = null;
    this.state.stepDuration = null;
    this.state.remainingPause = null;
    this.state.lastTime = null;
    this.state.tooltip = null;
  }

  /**
   * 达到延迟时间后自动启动
   * 执行关键点动画
   */
  private __beforeRender(timestamp: number) {
    if (
      (this.state.initialStart || (this.config.autostartOnIdle && !this.state.disableOnIdle)) &&
      this.viewer.state.idleTime > 0 &&
      timestamp - this.viewer.state.idleTime > this.config.autostartDelay
    ) {
      this.start();
    }

    if (this.isEnabled() && this.keypoints) {
      // 初始化
      if (!this.state.startTime) {
        this.state.endStep = serializePt(this.viewer.getPosition());
        this.__nextStep();

        this.state.startTime = timestamp;
        this.state.lastTime = timestamp;
      }

      this.__nextFrame(timestamp);
    }
  }

  private __shiftKeypoints() {
    const currentPosition = serializePt(this.viewer.getPosition());
    const index = this.__findMinIndex(this.keypoints, (keypoint) => {
      return utils.greatArcDistance(keypoint.position, currentPosition);
    });

    this.keypoints.push(...this.keypoints.splice(0, index));
  }

  private __incrementIdx() {
    this.state.idx++;
    if (this.state.idx === this.keypoints.length) {
      this.state.idx = 0;
    }
  }

  private __showTooltip() {
    const keypoint = this.keypoints[this.state.idx];

    if (keypoint.tooltip) {
      const position = this.viewer.dataHelper.vector3ToViewerCoords(this.viewer.state.direction);

      this.state.tooltip = this.viewer.createTooltip({
        content: keypoint.tooltip.content,
        position: keypoint.tooltip.position,
        top: position.y,
        left: position.x,
      });
    } else if (keypoint.markerId) {
      const marker = this.markers.getMarker(keypoint.markerId);
      marker.showTooltip();
      this.state.tooltip = marker.tooltip;
    }
  }

  private __hideTooltip() {
    if (this.state.tooltip) {
      const keypoint = this.keypoints[this.state.idx];

      if (keypoint.tooltip) {
        this.state.tooltip.hide();
      } else if (keypoint.markerId) {
        const marker = this.markers.getMarker(keypoint.markerId);
        marker.hideTooltip();
      }

      this.state.tooltip = null;
    }
  }

  private __nextPoint() {
    // 获取计算当前运动所需的 4 个点：
    // 当前线段的两个点，以及前后各一个点
    const workPoints = [];
    if (this.state.idx === -1) {
      const currentPosition = serializePt(this.viewer.getPosition());
      workPoints.push(currentPosition, currentPosition, this.keypoints[0].position, this.keypoints[1].position);
    } else {
      for (let i = -1; i < 3; i++) {
        const keypoint =
          this.state.idx + i < 0
            ? this.keypoints[this.keypoints.length - 1]
            : this.keypoints[(this.state.idx + i) % this.keypoints.length];
        workPoints.push(keypoint.position);
      }
    }

    // 应用偏移，避免跨越原点
    const workVectors = [new Vector2(workPoints[0][0], workPoints[0][1])];

    let k = 0;
    for (let i = 1; i <= 3; i++) {
      const d = workPoints[i - 1][0] - workPoints[i][0];
      if (d > Math.PI) {
        // 从左向右跨过原点
        k += 1;
      } else if (d < -Math.PI) {
        // 从右向左跨过原点
        k -= 1;
      }
      if (k !== 0 && i === 1) {
        // 不修改第一个点，而是将反向偏移应用到前一个点
        workVectors[0].x -= k * 2 * Math.PI;
        k = 0;
      }
      workVectors.push(new Vector2(workPoints[i][0] + k * 2 * Math.PI, workPoints[i][1]));
    }

    const curve: Array<[number, number]> = new SplineCurve(workVectors).getPoints(NUM_STEPS * 3).map((p) => [p.x, p.y]);

    // debugCurve(this.markers, curve, NUM_STEPS);

    // 只保留当前运动所需的曲线
    this.state.curve = curve.slice(NUM_STEPS + 1, NUM_STEPS * 2 + 1);

    if (this.state.idx !== -1) {
      this.state.remainingPause = this.keypoints[this.state.idx].pause;

      if (this.state.remainingPause) {
        this.__showTooltip();
      } else {
        this.__incrementIdx();
      }
    } else {
      this.__incrementIdx();
    }
  }

  private __nextStep() {
    if (this.state.curve.length === 0) {
      this.__nextPoint();

      // 重置对前一个点做过的变换
      this.state.endStep[0] = utils.parseAngle(this.state.endStep[0]);
    }

    // 目标下一个点
    this.state.startStep = this.state.endStep;
    this.state.endStep = this.state.curve.shift();

    // 根据距离和速度计算时长
    const distance = utils.greatArcDistance(this.state.startStep, this.state.endStep);
    this.state.stepDuration = (distance * 1000) / Math.abs(this.config.autorotateSpeed);

    if (distance === 0) {
      // 边界情况
      this.__nextStep();
    }
  }

  private __nextFrame(timestamp: number) {
    const ellapsed = timestamp - this.state.lastTime;
    this.state.lastTime = timestamp;

    // 当前已暂停
    if (this.state.remainingPause) {
      this.state.remainingPause = Math.max(0, this.state.remainingPause - ellapsed);
      if (this.state.remainingPause > 0) {
        return;
      } else {
        this.__hideTooltip();
        this.__incrementIdx();
        this.state.startTime = timestamp;
      }
    }

    let progress = (timestamp - this.state.startTime) / this.state.stepDuration;
    if (progress >= 1) {
      this.__nextStep();
      progress = 0;
      this.state.startTime = timestamp;
    }

    this.viewer.rotate({
      yaw: this.state.startStep[0] + (this.state.endStep[0] - this.state.startStep[0]) * progress,
      pitch: this.state.startStep[1] + (this.state.endStep[1] - this.state.startStep[1]) * progress,
    });
  }

  private __findMinIndex<T>(array: T[], mapper: (item: T) => number) {
    let idx = 0;
    let current = Number.MAX_VALUE;

    array.forEach((item, i) => {
      const value = mapper(item);
      if (value < current) {
        current = value;
        idx = i;
      }
    });

    return idx;
  }

  private __onKeyPress(e: events.KeypressEvent) {
    if (this.viewer.state.keyboardEnabled && e.matches(CONSTANTS.KEY_CODES.Space)) {
      this.toggle();
      e.preventDefault();
    }
  }
}

import { Object3D } from 'three';
import { PSVError } from './PSVError';
import type { AbstractAdapter } from './adapters/AbstractAdapter';
import type { AbstractComponent } from './components/AbstractComponent';
import { Loader } from './components/Loader';
import { Navbar } from './components/Navbar';
import { Notification } from './components/Notification';
import { Overlay } from './components/Overlay';
import { Panel } from './components/Panel';
import { Tooltip, TooltipConfig } from './components/Tooltip';
import { Cache } from './data/cache';
import { CONFIG_PARSERS, DEFAULTS, getViewerConfig, READONLY_OPTIONS } from './data/config';
import { IDS, VIEWER_DATA } from './data/constants';
import { SYSTEM } from './data/system';
import {
  BeforeAnimateEvent,
  BeforeRotateEvent,
  ConfigChangedEvent,
  PanoramaErrorEvent,
  PanoramaLoadedEvent,
  PanoramaLoadEvent,
  ReadyEvent,
  SizeUpdatedEvent,
  StopAllEvent,
  TransitionDoneEvent,
  ViewerEvents,
  ZoomUpdatedEvent,
} from './events';
import errorIcon from './icons/error.svg';
import { TypedEventTarget } from './lib/TypedEventTarget';
import {
  AnimateOptions,
  CssSize,
  ExtendedPosition,
  PanoramaOptions,
  ParsedViewerConfig,
  Position,
  Size,
  UpdatableViewerConfig,
  ViewerConfig,
} from './model';
import type { AbstractPlugin, PluginConstructor } from './plugins/AbstractPlugin';
import { pluginInterop } from './plugins/AbstractPlugin';
import { DataHelper } from './services/DataHelper';
import { EventsHandler } from './services/EventsHandler';
import { Renderer } from './services/Renderer';
import { TextureLoader } from './services/TextureLoader';
import { ViewerDynamics } from './services/ViewerDynamics';
import { ViewerState } from './services/ViewerState';
import {
  Animation,
  checkClosedShadowDom,
  checkStylesheet,
  exitFullscreen,
  getAbortError,
  getElement,
  isAbortError,
  isExtendedPosition,
  isFullscreenEnabled,
  isNil,
  logWarn,
  requestFullscreen,
  resolveBoolean,
  toggleClass,
} from './utils';

/**
 * 全景图查看器控制器
 */
export class Viewer extends TypedEventTarget<ViewerEvents> {
  readonly state: ViewerState;
  readonly config: ParsedViewerConfig;

  readonly parent: HTMLElement;
  readonly container: HTMLElement;

  /** @internal */
  readonly adapter: AbstractAdapter<any, any, any, Object3D>;
  /** @internal */
  readonly plugins: Record<string, AbstractPlugin<any>> = {};
  /** @internal */
  readonly dynamics: ViewerDynamics;

  readonly renderer: Renderer;
  readonly textureLoader: TextureLoader;
  /** @internal */
  readonly eventsHandler: EventsHandler;
  readonly dataHelper: DataHelper;

  readonly loader: Loader;
  readonly navbar: Navbar;
  readonly notification: Notification;
  readonly overlay: Overlay;
  readonly panel: Panel;

  /** @internal */
  readonly children: AbstractComponent[] = [];

  constructor(config: ViewerConfig) {
    super();

    // init
    this.parent = getElement(config.container);
    if (!this.parent) {
      throw new PSVError(`未找到 "container" 元素。`);
    }

    // @ts-ignore
    this.parent[VIEWER_DATA] = this;

    this.container = document.createElement('div');
    this.container.classList.add('psv-container');
    this.parent.appendChild(this.container);

    checkClosedShadowDom(this.parent);
    checkStylesheet(this.container, 'core');

    this.state = new ViewerState();
    this.config = getViewerConfig(config);

    this.__setSize(this.config.size);

    this.overlay = new Overlay(this);

    try {
      SYSTEM.load();
    } catch (err) {
      console.error(err);
      this.showError(this.config.lang.webglError);
      return;
    }

    Cache.init();

    this.adapter = new this.config.adapter[0](this, this.config.adapter[1]);

    this.renderer = new Renderer(this);
    this.textureLoader = new TextureLoader(this);
    this.eventsHandler = new EventsHandler(this);
    this.dataHelper = new DataHelper(this);
    this.dynamics = new ViewerDynamics(this);

    this.adapter.init?.();

    this.loader = new Loader(this);
    this.navbar = new Navbar(this);
    this.panel = new Panel(this);
    this.notification = new Notification(this);

    this.autoSize();
    this.setCursor(null);

    resolveBoolean(SYSTEM.isTouchEnabled, (enabled) => {
      toggleClass(this.container, 'psv--is-touch', enabled);
    });

    // init plugins
    this.config.plugins.forEach(([plugin, opts]) => {
      // @ts-ignore
      this.plugins[plugin.id] = new plugin(this, opts);
    });
    for (const plugin of Object.values(this.plugins)) {
      plugin.init?.();
    }

    // init buttons
    if (this.config.navbar) {
      this.navbar.setButtons(this.config.navbar);
    }

    // 加载全景图
    if (!this.state.loadingPromise) {
      if (this.config.panorama) {
        this.setPanorama(this.config.panorama, {
          sphereCorrection: this.config.sphereCorrection,
          panoData: this.config.panoData,
        });
      } else {
        this.loader.show();
      }
    }
  }

  /**
   * 销毁查看器
   */
  destroy() {
    this.stopAll();
    this.stopKeyboardControl();
    this.exitFullscreen();

    for (const [id, plugin] of Object.entries(this.plugins)) {
      plugin.destroy();
      delete this.plugins[id];
    }

    this.children.slice().forEach((child) => child.destroy());
    this.children.length = 0;

    this.eventsHandler?.destroy();
    this.renderer?.destroy();
    this.textureLoader?.destroy();
    this.dataHelper?.destroy();
    this.adapter?.destroy();
    this.dynamics?.destroy();

    this.parent.removeChild(this.container);
    // @ts-ignore
    delete this.parent[VIEWER_DATA];
  }

  private init() {
    this.eventsHandler.init();
    this.renderer.init();

    if (this.config.navbar) {
      this.navbar.show();
    }

    if (this.config.keyboard === 'always') {
      this.startKeyboardControl();
    }

    this.resetIdleTimer();

    this.state.ready = true;

    this.dispatchEvent(new ReadyEvent());
  }

  /**
   * 重启空闲计时器
   * @internal
   */
  resetIdleTimer() {
    this.state.idleTime = performance.now();
  }

  /**
   * 停止空闲计时器
   * @internal
   */
  disableIdleTimer() {
    this.state.idleTime = -1;
  }

  /**
   * 返回插件实例（如果存在）
   * @example 通过插件标识符获取
   * ```js
   * viewer.getPlugin('markers')
   * ```
   * @example 通过插件类获取，并获得 TypeScript 类型支持
   * ```ts
   * viewer.getPlugin<MarkersPlugin>(MarkersPlugin)
   * ```
   */
  getPlugin<T extends AbstractPlugin<any>>(pluginId: string | PluginConstructor): T {
    if (typeof pluginId === 'string') {
      return this.plugins[pluginId] as T;
    } else {
      const pluginCtor = pluginInterop(pluginId);
      return pluginCtor ? (this.plugins[pluginCtor.id] as T) : null;
    }
  }

  /**
   * 返回相机当前位置
   */
  getPosition(): Position {
    return this.dataHelper.cleanPosition(this.dynamics.position.current);
  }

  /**
   * 返回当前缩放级别
   */
  getZoomLevel(): number {
    return this.dynamics.zoom.current;
  }

  /**
   * 返回当前查看器尺寸
   */
  getSize(): Size {
    return { ...this.state.size };
  }

  /**
   * 检查查看器是否处于全屏状态
   */
  isFullscreenEnabled(): boolean {
    return isFullscreenEnabled(this.parent, SYSTEM.isIphone);
  }

  /**
   * 请求重新渲染场景
   */
  needsUpdate() {
    this.state.needsUpdate = true;
  }

  /**
   * 请求连续渲染场景（用于视频）
   */
  needsContinuousUpdate(enabled: boolean) {
    if (enabled) {
      this.state.continuousUpdateCount++;
    } else if (this.state.continuousUpdateCount > 0) {
      this.state.continuousUpdateCount--;
    }
  }

  /**
   * 查看器尺寸变化时调整场景尺寸
   */
  autoSize() {
    if (
      this.container.clientWidth !== this.state.size.width ||
      this.container.clientHeight !== this.state.size.height
    ) {
      this.state.size.width = Math.round(this.container.clientWidth);
      this.state.size.height = Math.round(this.container.clientHeight);
      this.state.aspect = this.state.size.width / this.state.size.height;
      this.state.hFov = this.dataHelper.vFovToHFov(this.state.vFov);

      this.dispatchEvent(new SizeUpdatedEvent(this.getSize()));
      this.navbar.autoSize();
    }
  }

  /**
   * 加载新的全景图文件
   * 加载新的全景图文件，可同时调整相机位置/缩放并启用过渡动画。<br>
   * 如果未传入 "options" 参数，相机不会移动，当前动画会继续执行。<br>
   * If another loading is already in progress it will be aborted.
   * @returns 如果加载被另一次调用中止，则 promise 解析为 false
   */
  setPanorama(path: any, options: PanoramaOptions = {}): Promise<boolean> {
    this.textureLoader.abortLoading();
    this.state.transitionAnimation?.cancel();

    const transition = this.dataHelper.getTransitionOptions(options);

    if (options.showLoader === undefined) {
      options.showLoader = true;
    }
    if (options.caption === undefined) {
      options.caption = this.config.caption;
    }
    if (options.description === undefined) {
      options.description = this.config.description;
    }
    if (!options.panoData && typeof this.config.panoData === 'function') {
      options.panoData = this.config.panoData;
    }

    this.hideError();
    this.resetIdleTimer();

    this.config.panorama = path;
    this.config.caption = options.caption;
    this.config.description = options.description;
    this.config.sphereCorrection = options.sphereCorrection;
    if (typeof this.config.panoData !== 'function' || typeof options.panoData === 'function') {
      this.config.panoData = options.panoData; // 如果默认 panoData 是函数，则保留它
    }

    const done = (err?: Error) => {
      if (isAbortError(err)) {
        return false;
      }

      this.loader.hide();
      this.state.loadingPromise = null;

      if (err) {
        this.navbar.setCaption(null);
        this.showError(this.config.lang.loadError);
        console.error(err);
        this.dispatchEvent(new PanoramaErrorEvent(path, err));
        throw err;
      } else {
        this.navbar.setCaption(this.config.caption);
        return true;
      }
    };

    this.navbar.setCaption(`<em>${this.config.lang.loading}</em>`);
    if (options.showLoader || !this.state.ready) {
      this.loader.show();
    }

    this.dispatchEvent(new PanoramaLoadEvent(path));

    const loadingPromise = this.adapter
      .loadTexture(this.config.panorama, true, options.panoData)
      .then((textureData) => {
        // 检查是否又请求了其他全景图
        if (textureData.panorama !== this.config.panorama) {
          this.adapter.disposeTexture(textureData);
          throw getAbortError();
        }

        const cleanOptions = this.dataHelper.cleanPanoramaOptions(options, textureData.panoData);

        if (!isNil(cleanOptions.zoom) || !isNil(cleanOptions.position)) {
          this.stopAll();
        }

        return {
          textureData,
          cleanOptions,
        };
      });

    if (!transition || !this.state.ready || !this.adapter.supportsTransition(this.config.panorama)) {
      this.state.loadingPromise = loadingPromise
        .then(({ textureData, cleanOptions }) => {
          this.renderer.show();
          this.renderer.setTexture(textureData);
          this.renderer.setPanoramaPose(textureData.panoData);
          this.renderer.setSphereCorrection(options.sphereCorrection);

          if (!this.state.ready) {
            this.init();
          }

          this.dispatchEvent(new PanoramaLoadedEvent(textureData));

          if (!isNil(cleanOptions.zoom)) {
            this.zoom(cleanOptions.zoom);
          }
          if (!isNil(cleanOptions.position)) {
            this.rotate(cleanOptions.position);
          }
        })
        .then(
          () => done(),
          (err) => done(err),
        );
    } else {
      this.state.loadingPromise = loadingPromise
        .then(({ textureData, cleanOptions }) => {
          this.loader.hide();

          this.dispatchEvent(new PanoramaLoadedEvent(textureData));

          this.state.transitionAnimation = this.renderer.transition(textureData, cleanOptions, transition);
          return this.state.transitionAnimation;
        })
        .then((completed) => {
          this.state.transitionAnimation = null;

          this.dispatchEvent(new TransitionDoneEvent(completed));

          if (!completed) {
            throw getAbortError();
          }
        })
        .then(
          () => done(),
          (err) => done(err),
        );
    }

    return this.state.loadingPromise;
  }

  /**
   * 更新配置项
   * @throws {@link PSVError} 配置无效时抛出
   */
  setOptions(options: Partial<UpdatableViewerConfig>) {
    const rawConfig: ViewerConfig = {
      ...this.config,
      ...options,
    };

    for (let [key, value] of Object.entries(options) as Array<[keyof typeof rawConfig, any]>) {
      if (!(key in DEFAULTS)) {
        logWarn(`Unknown option ${key}`);
        continue;
      }

      if (key in READONLY_OPTIONS) {
        logWarn((READONLY_OPTIONS as any)[key]);
        continue;
      }

      if (key in CONFIG_PARSERS) {
        // @ts-ignore
        value = CONFIG_PARSERS[key](value, {
          rawConfig: rawConfig,
          defValue: DEFAULTS[key],
        } as any);
      }

      // @ts-ignore
      this.config[key] = value;

      switch (key) {
        case 'mousemove':
          if (!this.state.cursorOverride) {
            this.setCursor(null);
          }
          break;

        case 'caption':
          this.navbar.setCaption(this.config.caption);
          break;

        case 'size':
          this.resize(this.config.size);
          break;

        case 'sphereCorrection':
          this.renderer.setSphereCorrection(this.config.sphereCorrection);
          break;

        case 'navbar':
        case 'lang':
          this.navbar.setButtons(this.config.navbar);
          break;

        case 'moveSpeed':
        case 'zoomSpeed':
          this.dynamics.updateSpeeds();
          break;

        case 'minFov':
        case 'maxFov':
          this.dynamics.zoom.setValue(this.dataHelper.fovToZoomLevel(this.state.vFov));
          this.dispatchEvent(new ZoomUpdatedEvent(this.getZoomLevel()));
          break;

        case 'keyboard':
          if (this.config.keyboard === 'always') {
            this.startKeyboardControl();
          } else {
            this.stopKeyboardControl();
          }
          break;

        default:
          break;
      }
    }

    this.needsUpdate();

    this.dispatchEvent(new ConfigChangedEvent(Object.keys(options) as any));
  }

  /**
   * 更新配置项
   * @throws {@link PSVError} 配置无效时抛出
   */
  setOption<T extends keyof UpdatableViewerConfig>(option: T, value: UpdatableViewerConfig[T]) {
    this.setOptions({ [option]: value });
  }

  /**
   * 在查看器上方显示错误消息
   */
  showError(message: string) {
    this.overlay.show({
      id: IDS.ERROR,
      image: errorIcon,
      title: message,
      dismissible: false,
    });
  }

  /**
   * 隐藏错误消息
   */
  hideError() {
    this.overlay.hide(IDS.ERROR);
  }

  /**
   * 将视图旋转到指定位置
   */
  rotate(position: ExtendedPosition) {
    const e = new BeforeRotateEvent(this.dataHelper.cleanPosition(position));
    this.dispatchEvent(e);

    if (e.defaultPrevented) {
      return;
    }

    this.dynamics.position.setValue(e.position);
  }

  /**
   * Zooms to a specific level between `maxFov` and `minFov`
   */
  zoom(level: number) {
    this.dynamics.zoom.setValue(level);
  }

  /**
   * 放大
   */
  zoomIn(step = 1) {
    this.dynamics.zoom.step(step);
  }

  /**
   * 缩小
   */
  zoomOut(step = 1) {
    this.dynamics.zoom.step(-step);
  }

  /**
   * 通过平滑动画旋转并缩放视图
   */
  animate(options: AnimateOptions): Animation {
    const positionProvided = isExtendedPosition(options);
    const zoomProvided = !isNil(options.zoom);

    const e = new BeforeAnimateEvent(
      positionProvided ? this.dataHelper.cleanPosition(options) : undefined,
      options.zoom,
    );
    this.dispatchEvent(e);

    if (e.defaultPrevented) {
      return;
    }

    this.stopAll();

    const { duration, properties } = this.dataHelper.getAnimationProperties(options.speed, e.position, e.zoomLevel);

    // 不需要动画时
    if (!duration) {
      if (positionProvided) {
        this.rotate(e.position);
      }
      if (zoomProvided) {
        this.zoom(e.zoomLevel);
      }

      return new Animation(null);
    }

    this.state.animation = new Animation({
      properties: properties,
      duration: duration,
      easing: options.easing || 'inOutSine',
      onTick: (props) => {
        if (positionProvided) {
          this.dynamics.position.setValue({
            yaw: props.yaw,
            pitch: props.pitch,
          });
        }
        if (zoomProvided) {
          this.dynamics.zoom.setValue(props.zoom);
        }
      },
    });

    this.state.animation.then(() => {
      this.state.animation = null;
      this.resetIdleTimer();
    });

    return this.state.animation;
  }

  /**
   * 停止正在进行的动画
   * 返回值为 Promise，因为无法保证动画能被同步停止。
   */
  stopAnimation(): PromiseLike<any> {
    if (this.state.animation) {
      this.state.animation.cancel();
      return this.state.animation;
    } else {
      return Promise.resolve();
    }
  }

  /**
   * 调整查看器尺寸
   */
  resize(size: CssSize) {
    this.__setSize(size);
    this.autoSize();
  }

  private __setSize(size?: CssSize) {
    (['width', 'height'] as Array<'width' | 'height'>).forEach((dim) => {
      if (size?.[dim]) {
        if (/^[0-9.]+$/.test(size[dim])) {
          size[dim] += 'px';
        }
        this.parent.style[dim] = size[dim];
      }
    });
  }

  /**
   * 进入全屏模式
   */
  enterFullscreen() {
    if (!this.isFullscreenEnabled()) {
      requestFullscreen(this.parent, SYSTEM.isIphone);
    }
  }

  /**
   * 退出全屏模式
   */
  exitFullscreen() {
    if (this.isFullscreenEnabled()) {
      exitFullscreen(SYSTEM.isIphone);
    }
  }

  /**
   * 进入或退出全屏模式
   */
  toggleFullscreen() {
    if (!this.isFullscreenEnabled()) {
      this.enterFullscreen();
    } else {
      this.exitFullscreen();
    }
  }

  /**
   * 启用键盘控制
   */
  startKeyboardControl() {
    this.state.keyboardEnabled = true;
  }

  /**
   * 禁用键盘控制
   */
  stopKeyboardControl() {
    this.state.keyboardEnabled = false;
  }

  /**
   * Creates a new tooltip
   * 使用 {@link Tooltip.move} 更新提示框，避免重新创建
   * @throws {@link PSVError} 配置无效时抛出
   */
  createTooltip(config: TooltipConfig): Tooltip {
    return new Tooltip(this, config);
  }

  /**
   * 修改全局鼠标光标
   */
  setCursor(cursor: string | null) {
    this.state.cursorOverride = cursor;
    if (!cursor) {
      this.container.style.cursor = this.config.mousemove ? 'move' : 'default';
    } else {
      this.container.style.cursor = cursor;
    }
  }

  /**
   * 订阅 three.js 场景中对象的事件
   * @param userDataKey - 只观察带有此 `userData` 的对象
   */
  observeObjects(userDataKey: string): void {
    if (!this.state.objectsObservers[userDataKey]) {
      this.state.objectsObservers[userDataKey] = null;
    }
  }

  /**
   * Unsubscribes to events on objects
   */
  unobserveObjects(userDataKey: string): void {
    delete this.state.objectsObservers[userDataKey];
  }

  /**
   * 停止当前所有动画
   * @internal
   */
  stopAll(): PromiseLike<void> {
    this.dispatchEvent(new StopAllEvent());

    this.disableIdleTimer();

    return this.stopAnimation();
  }
}

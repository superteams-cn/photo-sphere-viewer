import { Mesh, Vector3 } from 'three';
import { SPHERE_RADIUS } from '../data/constants';
import { Size, TextureData } from '../model';
import type { Animation } from '../utils';

/**
 * 查看器内部属性
 */
export class ViewerState {
  /**
   * 所有组件是否已加载
   */
  ready = false;

  /**
   * 视图是否需要重新渲染
   */
  needsUpdate = false;

  /**
   * 请求连续渲染场景的插件数量
   */
  continuousUpdateCount = 0;

  /**
   * 当前是否监听键盘事件
   */
  keyboardEnabled = false;

  /**
   * 相机方向
   */
  direction = new Vector3(0, 0, SPHERE_RADIUS);

  /**
   * 当前相机滚转角
   */
  roll = 0;

  /**
   * 垂直视场角
   */
  vFov = 60;

  /**
   * 水平视场角
   */
  hFov = 60;

  /**
   * 渲染器宽高比
   */
  aspect = 1;

  /**
   * 当前正在运行的动画
   */
  animation: Animation = null;

  /**
   * 当前正在运行的过渡
   */
  transitionAnimation: Animation = null;

  /**
   * 最近一次调用 `setPanorama()` 的 Promise
   */
  loadingPromise: Promise<any> = null;

  /**
   * 最近一次用户操作的时间
   */
  idleTime = -1;

  /**
   * 已注册的 THREE 对象观察器
   */
  objectsObservers: Record<string, Mesh | null> = {};

  /**
   * 容器尺寸
   */
  size: Size = {
    width: 0,
    height: 0,
  };

  /**
   * 当前显示的全景图纹理
   */
  textureData: TextureData;

  /**
   * 当前覆盖的全局光标
   */
  cursorOverride: string;

  /**
   * @internal
   */
  // eslint-disable-next-line  @typescript-eslint/no-empty-function
  constructor() {}
}

import { Euler, MathUtils, Vector3 } from 'three';
import { PSVError } from '../PSVError';
import type { Viewer } from '../Viewer';
import { DEFAULTS } from '../data/config';
import { ANIMATION_MIN_DURATION, SPHERE_RADIUS, VIEWER_DATA } from '../data/constants';
import {
  ExtendedPosition,
  PanoData,
  PanoramaOptions,
  PanoramaPosition,
  Point,
  Position,
  SphereCorrection,
  TransitionOptions,
} from '../model';
import {
  AnimationOptions,
  applyEulerInverse,
  getAngle,
  getShortestArc,
  isExtendedPosition,
  isNil,
  parseAngle,
  speedToDuration,
} from '../utils';
import { AbstractService } from './AbstractService';

const vector3 = new Vector3();
const EULER_ZERO = new Euler(0, 0, 0, 'ZXY');

/**
 * 查看器数据转换器集合
 */
export class DataHelper extends AbstractService {
  /**
   * @internal
   */
  constructor(viewer: Viewer) {
    super(viewer);
  }

  /**
   * 将垂直视场角转换为缩放级别
   */
  fovToZoomLevel(fov: number): number {
    const temp = Math.round(((fov - this.config.minFov) / (this.config.maxFov - this.config.minFov)) * 100);
    return MathUtils.clamp(temp - 2 * (temp - 50), 0, 100);
  }

  /**
   * 将缩放级别转换为垂直视场角
   */
  zoomLevelToFov(level: number): number {
    return this.config.maxFov + (level / 100) * (this.config.minFov - this.config.maxFov);
  }

  /**
   * 将垂直视场角转换为水平视场角
   */
  vFovToHFov(vFov: number): number {
    return MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(vFov) / 2) * this.state.aspect));
  }

  /**
   * 将水平视场角转换为垂直视场角
   */
  hFovToVFov(hFov: number): number {
    return MathUtils.radToDeg(2 * Math.atan(Math.tan(MathUtils.degToRad(hFov) / 2) / this.state.aspect));
  }

  /**
   * @internal
   */
  getAnimationProperties(
    speed: number | string,
    targetPosition: Position,
    targetZoom: number,
  ): {
    duration: number;
    properties: AnimationOptions<{ yaw: any; pitch: any; zoom: any }>['properties'];
  } {
    const positionProvided = !isNil(targetPosition);
    const zoomProvided = !isNil(targetZoom);

    const properties: AnimationOptions<{ yaw: any; pitch: any; zoom: any }>['properties'] = {};
    let duration = null;

    // 清理/过滤位置并计算时长
    if (positionProvided) {
      const currentPosition = this.viewer.getPosition();
      const dYaw = getShortestArc(currentPosition.yaw, targetPosition.yaw);

      properties.yaw = { start: currentPosition.yaw, end: currentPosition.yaw + dYaw };
      properties.pitch = { start: currentPosition.pitch, end: targetPosition.pitch };

      duration = speedToDuration(speed, getAngle(currentPosition, targetPosition));
    }

    // 清理/过滤缩放并计算时长
    if (zoomProvided) {
      const currentZoom = this.viewer.getZoomLevel();
      const dZoom = Math.abs(targetZoom - currentZoom);

      properties.zoom = { start: currentZoom, end: targetZoom };

      if (duration === null) {
        // 仅缩放且提供速度时，使用约定的 PI/4 计算时长
        duration = speedToDuration(speed, ((Math.PI / 4) * dZoom) / 100);
      }
    }

    // 没有需要动画的内容
    if (duration === null) {
      if (typeof speed === 'number') {
        duration = speed;
      } else {
        duration = ANIMATION_MIN_DURATION;
      }
    } else {
      duration = Math.max(ANIMATION_MIN_DURATION, duration);
    }

    return { duration, properties };
  }

  /**
   * @internal
   */
  getTransitionOptions(options: PanoramaOptions): TransitionOptions {
    let transition: TransitionOptions;
    const defaultTransition = this.config.defaultTransition ?? DEFAULTS.defaultTransition;

    if (options.transition === false || options.transition === null) {
      transition = null;
    } else if (options.transition === true) {
      transition = {
        ...defaultTransition,
      };
    } else if (typeof options.transition === 'object') {
      transition = {
        ...defaultTransition,
        ...options.transition,
      };
    } else {
      transition = this.config.defaultTransition;
    }

    return transition;
  }

  /**
   * 将像素纹理坐标转换为球面弧度坐标
   * @throws {@link Core.PSVError | PSVError} 当前适配器不支持纹理坐标时抛出
   */
  textureCoordsToSphericalCoords(point: PanoramaPosition): Position {
    if (!this.state.textureData?.panoData) {
      throw new PSVError('当前适配器不支持纹理坐标，或尚未加载纹理。');
    }

    const result = this.viewer.adapter.textureCoordsToSphericalCoords(point, this.state.textureData.panoData);

    if (
      !EULER_ZERO.equals(this.viewer.renderer.panoramaPose) ||
      !EULER_ZERO.equals(this.viewer.renderer.sphereCorrection)
    ) {
      this.sphericalCoordsToVector3(result, vector3);
      vector3.applyEuler(this.viewer.renderer.panoramaPose);
      vector3.applyEuler(this.viewer.renderer.sphereCorrection);
      return this.vector3ToSphericalCoords(vector3);
    } else {
      return result;
    }
  }

  /**
   * 将球面弧度坐标转换为像素纹理坐标
   * @throws {@link Core.PSVError | PSVError} 当前适配器不支持纹理坐标时抛出
   */
  sphericalCoordsToTextureCoords(position: Position): PanoramaPosition {
    if (!this.state.textureData?.panoData) {
      throw new PSVError('当前适配器不支持纹理坐标，或尚未加载纹理。');
    }

    if (
      !EULER_ZERO.equals(this.viewer.renderer.panoramaPose) ||
      !EULER_ZERO.equals(this.viewer.renderer.sphereCorrection)
    ) {
      this.sphericalCoordsToVector3(position, vector3);
      applyEulerInverse(vector3, this.viewer.renderer.sphereCorrection);
      applyEulerInverse(vector3, this.viewer.renderer.panoramaPose);
      position = this.vector3ToSphericalCoords(vector3);
    }

    return this.viewer.adapter.sphericalCoordsToTextureCoords(position, this.state.textureData.panoData);
  }

  /**
   * 将球面弧度坐标转换为 Vector3
   */
  sphericalCoordsToVector3(position: Position, vector?: Vector3, distance = SPHERE_RADIUS): Vector3 {
    if (!vector) {
      vector = new Vector3();
    }
    vector.x = distance * -Math.cos(position.pitch) * Math.sin(position.yaw);
    vector.y = distance * Math.sin(position.pitch);
    vector.z = distance * Math.cos(position.pitch) * Math.cos(position.yaw);
    return vector;
  }

  /**
   * 将 Vector3 转换为球面弧度坐标
   */
  vector3ToSphericalCoords(vector: Vector3): Position {
    const phi = Math.acos(vector.y / Math.sqrt(vector.x * vector.x + vector.y * vector.y + vector.z * vector.z));
    const theta = Math.atan2(vector.x, vector.z);

    return {
      yaw: theta < 0 ? -theta : Math.PI * 2 - theta,
      pitch: Math.PI / 2 - phi,
    };
  }

  /**
   * 将查看器中的位置转换为 THREE.Vector3
   */
  viewerCoordsToVector3(viewerPoint: Point): Vector3 {
    const sphereIntersect = this.viewer.renderer
      .getIntersections(viewerPoint)
      .filter((i) => i.object.userData[VIEWER_DATA]);

    if (sphereIntersect.length) {
      return sphereIntersect[0].point;
    } else {
      return null;
    }
  }

  /**
   * 将查看器中的位置转换为球面弧度坐标
   */
  viewerCoordsToSphericalCoords(viewerPoint: Point): Position {
    const vector = this.viewerCoordsToVector3(viewerPoint);
    return vector ? this.vector3ToSphericalCoords(vector) : null;
  }

  /**
   * 将 Vector3 转换为查看器中的位置
   */
  vector3ToViewerCoords(vector: Vector3): Point {
    const vectorClone = vector.clone();
    vectorClone.project(this.viewer.renderer.camera);

    return {
      x: Math.round(((vectorClone.x + 1) / 2) * this.state.size.width),
      y: Math.round(((1 - vectorClone.y) / 2) * this.state.size.height),
    };
  }

  /**
   * 将球面弧度坐标转换为查看器中的位置
   */
  sphericalCoordsToViewerCoords(position: Position): Point {
    this.sphericalCoordsToVector3(position, vector3);
    return this.vector3ToViewerCoords(vector3);
  }

  /**
   * 检查 3D 场景中的点当前是否可见
   */
  isPointVisible(vector: Vector3): boolean;

  /**
   * 检查球面上的点当前是否可见
   */
  isPointVisible(position: Position): boolean;

  /**
   * @internal
   */
  isPointVisible(point: Vector3 | Position): boolean {
    let vector: Vector3;
    let viewerPoint: Point;

    if (point instanceof Vector3) {
      vector = point;
      viewerPoint = this.vector3ToViewerCoords(point);
    } else if (isExtendedPosition(point)) {
      vector = this.sphericalCoordsToVector3(point, vector3);
      viewerPoint = this.vector3ToViewerCoords(vector);
    } else {
      return false;
    }

    return (
      vector.dot(this.viewer.state.direction) > 0 &&
      viewerPoint.x >= 0 &&
      viewerPoint.x <= this.viewer.state.size.width &&
      viewerPoint.y >= 0 &&
      viewerPoint.y <= this.viewer.state.size.height
    );
  }

  /**
   * 若存在像素位置，则转换为角度并确保边界有效
   */
  cleanPosition(position: ExtendedPosition): Position {
    if ('yaw' in position || 'pitch' in position) {
      if (!('yaw' in position) || !('pitch' in position)) {
        throw new PSVError(`位置缺少 'yaw' 或 'pitch'。`);
      }
      return {
        yaw: parseAngle(position.yaw),
        pitch: parseAngle(position.pitch, true),
      };
    } else {
      return this.textureCoordsToSphericalCoords(position);
    }
  }

  /**
   * 确保 SphereCorrection 对象有效
   */
  cleanSphereCorrection(sphereCorrection: SphereCorrection): SphereCorrection<number> {
    return {
      pan: parseAngle(sphereCorrection?.pan || 0),
      tilt: parseAngle(sphereCorrection?.tilt || 0, true),
      roll: parseAngle(sphereCorrection?.roll || 0, true, false),
    };
  }

  /**
   * 解析 panoData 中的姿态角
   */
  cleanPanoramaPose(panoData: PanoData): SphereCorrection<number> {
    return {
      pan: MathUtils.degToRad(panoData?.poseHeading || 0),
      tilt: MathUtils.degToRad(panoData?.posePitch || 0),
      roll: MathUtils.degToRad(panoData?.poseRoll || 0),
    };
  }

  /**
   * 如果全景图文件包含 "InitialView" 元数据，则更新全景图选项
   */
  cleanPanoramaOptions(options: PanoramaOptions, panoData: PanoData): PanoramaOptions {
    if (!panoData?.isEquirectangular) {
      return options;
    }

    if (isNil(options.zoom) && !isNil(panoData.initialFov)) {
      options = {
        ...options,
        zoom: this.fovToZoomLevel(this.hFovToVFov(panoData.initialFov)),
      };
    }
    if (isNil(options.position) && !isNil(panoData.initialHeading) && !isNil(panoData.initialPitch)) {
      options = {
        ...options,
        position: {
          yaw: parseAngle(panoData.initialHeading),
          pitch: parseAngle(panoData.initialPitch, true),
        },
      };
    }
    return options;
  }
}

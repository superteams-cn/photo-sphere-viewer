import { CONSTANTS, Point, Position, PSVError, utils, type Viewer } from '@photo-sphere-viewer/core';
import { MathUtils } from 'three';
import { DEFAULT_HOVER_SCALE } from '../constants';
import { type MarkersPlugin } from '../MarkersPlugin';
import { MarkerType } from '../MarkerType';
import { MarkerConfig } from '../model';
import { AbstractDomMarker } from './AbstractDomMarker';
import { Marker } from './Marker';

/**
 * 标准标记基类
 * @internal
 */
export abstract class AbstractStandardMarker extends AbstractDomMarker {
  protected needsUpdateSize: boolean;

  constructor(viewer: Viewer, plugin: MarkersPlugin, config: MarkerConfig) {
    super(viewer, plugin, config);
  }

  protected override afterCreateElement(): void {
    super.afterCreateElement();

    this.domElement.addEventListener('transitionend', () => {
      // 缩放过渡只在鼠标移入时手动应用；
      // 视角缩放或移动导致缩放值改变时，不能保留过渡效果。
      this.domElement.style.transition = '';
    });
  }

  override render({
    viewerPosition,
    zoomLevel,
    hoveringMarker,
  }: {
    viewerPosition: Position;
    zoomLevel: number;
    hoveringMarker: Marker;
  }): Point {
    this.__updateSize();

    const position = this.viewer.dataHelper.vector3ToViewerCoords(this.state.positions3D[0]);
    position.x -= this.state.size.width * this.state.anchor.x;
    position.y -= this.state.size.height * this.state.anchor.y;

    // 先判断该点是否大致位于相机朝向内，再判断它是否落在视口中
    const isVisible =
      this.state.positions3D[0].dot(this.viewer.state.direction) > 0 &&
      position.x + this.state.size.width >= 0 &&
      position.x - this.state.size.width <= this.viewer.state.size.width &&
      position.y + this.state.size.height >= 0 &&
      position.y - this.state.size.height <= this.viewer.state.size.height;

    if (isVisible) {
      this.domElement.style.translate = `${position.x}px ${position.y}px 0px`;

      this.applyScale({
        zoomLevel,
        viewerPosition,
        mouseover: this === hoveringMarker,
      });

      return position;
    } else {
      return null;
    }
  }

  override update(config: MarkerConfig): void {
    super.update(config);

    if (!utils.isExtendedPosition(this.config.position)) {
      throw new PSVError(`标记 ${this.id} 缺少位置。`);
    }

    // 将纹理坐标转换为球面坐标
    try {
      this.state.position = this.viewer.dataHelper.cleanPosition(this.config.position);
    } catch (e) {
      throw new PSVError(`标记 ${this.id} 的位置无效。`, e);
    }

    // 计算 x/y/z 位置
    this.state.positions3D = [this.viewer.dataHelper.sphericalCoordsToVector3(this.state.position)];

    const element = this.domElement;

    element.classList.add('psv-marker--normal');

    if (this.config.scale && Array.isArray(this.config.scale)) {
      this.config.scale = { zoom: this.config.scale as any };
    }
    if (typeof this.config.hoverScale === 'boolean') {
      this.config.hoverScale = this.config.hoverScale
        ? this.plugin.config.defaultHoverScale || DEFAULT_HOVER_SCALE
        : null;
    } else if (typeof this.config.hoverScale === 'number') {
      this.config.hoverScale = { amount: this.config.hoverScale } as any;
    } else if (!this.config.hoverScale) {
      this.config.hoverScale = this.plugin.config.defaultHoverScale;
    }
    if (this.config.hoverScale) {
      this.config.hoverScale = {
        ...this.plugin.config.defaultHoverScale,
        ...this.config.hoverScale,
      };
    }

    // 设置旋转
    element.style.rotate =
      this.config.rotation.roll !== 0 ? MathUtils.radToDeg(this.config.rotation.roll) + 'deg' : null;

    // 设置锚点
    element.style.transformOrigin = `${this.state.anchor.x * 100}% ${this.state.anchor.y * 100}%`;
  }

  /**
   * 计算标记的真实尺寸
   * @description 查询边界矩形前，先移除所有变换（如果存在）并临时显示标记。
   */
  private __updateSize() {
    if (!this.needsUpdateSize) {
      return;
    }

    const element = this.domElement;
    const makeTransparent = !this.state.visible || !this.state.size;

    if (makeTransparent) {
      element.classList.add('psv-marker--transparent');
    }

    if (this.isSvg()) {
      const rect = (element.firstElementChild as SVGElement).getBoundingClientRect();
      this.state.size = {
        width: rect.width,
        height: rect.height,
      };
    } else {
      this.state.size = {
        width: (element as HTMLElement).offsetWidth,
        height: (element as HTMLElement).offsetHeight,
      };
    }

    if (makeTransparent) {
      element.classList.remove('psv-marker--transparent');
    }

    if (this.isSvg()) {
      // 真实尺寸必须声明在 SVG 根节点上
      element.style.width = this.state.size.width + 'px';
      element.style.height = this.state.size.height + 'px';
    }

    // 自定义元素 HTML 标记保持动态
    if (this.type !== MarkerType.element) {
      this.needsUpdateSize = false;
    }
  }

  /**
   * 计算并应用标记缩放
   */
  applyScale({
    zoomLevel,
    viewerPosition,
    mouseover,
  }: {
    zoomLevel: number;
    viewerPosition: Position;
    mouseover: boolean;
  }) {
    if (mouseover !== null && this.config.hoverScale) {
      this.domElement.style.transition = `scale ${this.config.hoverScale.duration}ms ${this.config.hoverScale.easing}`;
    }

    let scale = 1;
    if (typeof this.config.scale === 'function') {
      scale = this.config.scale(zoomLevel, viewerPosition);
    } else if (this.config.scale) {
      if (Array.isArray(this.config.scale.zoom)) {
        const [min, max] = this.config.scale.zoom;
        scale *= min + (max - min) * CONSTANTS.EASINGS.inQuad(zoomLevel / 100);
      }
      if (Array.isArray(this.config.scale.yaw)) {
        const [min, max] = this.config.scale.yaw;
        const halfFov = MathUtils.degToRad(this.viewer.state.hFov) / 2;
        const arc = Math.abs(utils.getShortestArc(this.state.position.yaw, viewerPosition.yaw));
        scale *= max + (min - max) * CONSTANTS.EASINGS.outQuad(Math.max(0, (halfFov - arc) / halfFov));
      }
    }
    if (mouseover && this.config.hoverScale) {
      scale *= this.config.hoverScale.amount;
    }

    this.domElement.style.scale = `${scale}`;
  }
}

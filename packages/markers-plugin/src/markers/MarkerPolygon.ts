import {
  PSVError,
  PanoramaPosition,
  Point,
  Position,
  SphericalPosition,
  Viewer,
  utils,
} from '@photo-sphere-viewer/core';
import { Vector3 } from 'three';
import { MarkerType } from '../MarkerType';
import { MarkersPlugin } from '../MarkersPlugin';
import { MARKER_DATA, SVG_NS } from '../constants';
import { MarkerConfig } from '../model';
import { getGreatCircleIntersection, getPolygonCenter, getPolylineCenter } from '../utils';
import { AbstractDomMarker } from './AbstractDomMarker';

/**
 * @internal
 */
export class MarkerPolygon extends AbstractDomMarker {
  private positions3D: Vector3[][];

  constructor(viewer: Viewer, plugin: MarkersPlugin, config: MarkerConfig) {
    super(viewer, plugin, config);
  }

  override createElement(): void {
    this.element = document.createElementNS(SVG_NS, 'path');
    this.element[MARKER_DATA] = this;
  }

  override isPoly(): boolean {
    return true;
  }

  /**
   * 判断是否为使用像素坐标的多边形/折线
   */
  private get isPixels(): boolean {
    return this.type === MarkerType.polygonPixels || this.type === MarkerType.polylinePixels;
  }

  /**
   * 判断是否为多边形标记
   */
  private get isPolygon(): boolean {
    return this.type === MarkerType.polygon || this.type === MarkerType.polygonPixels;
  }

  /**
   * 判断是否为折线标记
   */
  private get isPolyline(): boolean {
    return this.type === MarkerType.polyline || this.type === MarkerType.polylinePixels;
  }

  private get coords(): Array<Array<[number, number]>> {
    return this.definition;
  }

  override render(): Point {
    const positions = this.__getAllPolyPositions();
    const isVisible = positions[0].length > (this.isPolygon ? 2 : 1);

    if (isVisible) {
      const position = this.viewer.dataHelper.sphericalCoordsToViewerCoords(this.state.position);

      const points = positions
        .filter((innerPos) => innerPos.length > 0)
        .map((innerPos) => {
          let innerPoints = 'M';
          innerPoints += innerPos.map((pos) => `${pos.x - position.x},${pos.y - position.y}`).join('L');
          if (this.isPolygon) {
            innerPoints += 'Z';
          }
          return innerPoints;
        })
        .join(' ');

      this.domElement.setAttributeNS(null, 'd', points);
      this.domElement.setAttributeNS(null, 'transform', `translate(${position.x} ${position.y})`);

      return position;
    } else {
      return null;
    }
  }

  override update(config: MarkerConfig): void {
    super.update(config);

    const element = this.domElement;

    element.classList.add('psv-marker--poly');

    // 设置样式
    if (this.config.svgStyle) {
      Object.entries(this.config.svgStyle).forEach(([prop, value]) => {
        element.setAttributeNS(null, utils.dasherize(prop), value);
      });

      if (this.isPolyline && !this.config.svgStyle.fill) {
        element.setAttributeNS(null, 'fill', 'none');
      }
    } else if (this.isPolygon) {
      element.setAttributeNS(null, 'fill', 'rgba(0,0,0,0.5)');
    } else if (this.isPolyline) {
      element.setAttributeNS(null, 'fill', 'none');
      element.setAttributeNS(null, 'stroke', 'rgb(0,0,0)');
    }

    try {
      // （向后兼容）折叠数组：[1,2,3,4] => [[1,2],[3,4]]
      let actualPoly: any = this.config[this.type];
      if (!Array.isArray(actualPoly[0]) && typeof actualPoly[0] !== 'object') {
        for (let i = 0; i < actualPoly.length; i++) {
          // @ts-ignore
          actualPoly.splice(i, 2, [actualPoly[i], actualPoly[i + 1]]);
        }
      }

      // 为孔洞创建嵌套数组
      if (!Array.isArray(actualPoly[0][0]) && typeof actualPoly[0][0] !== 'object') {
        actualPoly = [actualPoly];
      }

      if (this.isPolyline && actualPoly.length > 1) {
        throw new PSVError(`折线不能包含孔洞。`);
      }

      if (this.isPixels) {
        // 将纹理坐标转换为球面坐标
        this.definition = (actualPoly as Array<Array<[number, number] | PanoramaPosition>>).map((coords) => {
          return coords.map((coord) => {
            let sphericalCoord: Position;
            if (utils.isExtendedPosition(coord)) {
              sphericalCoord = this.viewer.dataHelper.cleanPosition(coord);
            } else {
              sphericalCoord = this.viewer.dataHelper.textureCoordsToSphericalCoords({
                textureX: coord[0],
                textureY: coord[1],
              });
            }
            return [sphericalCoord.yaw, sphericalCoord.pitch];
          });
        });
      } else {
        // 清理角度
        this.definition = (actualPoly as Array<Array<[number, number] | [string, string] | SphericalPosition>>).map(
          (coords) => {
            return coords.map((coord) => {
              let sphericalCoord: Position;
              if (utils.isExtendedPosition(coord)) {
                sphericalCoord = this.viewer.dataHelper.cleanPosition(coord);
              } else {
                sphericalCoord = this.viewer.dataHelper.cleanPosition({
                  yaw: coord[0],
                  pitch: coord[1],
                });
              }
              return [sphericalCoord.yaw, sphericalCoord.pitch];
            });
          },
        );
      }
    } catch (e) {
      throw new PSVError(`标记 ${this.id} 的位置无效。`, e);
    }

    // 计算 x/y/z 位置
    this.positions3D = this.coords.map((coords) => {
      return coords.map((coord) => {
        return this.viewer.dataHelper.sphericalCoordsToVector3({ yaw: coord[0], pitch: coord[1] });
      });
    });

    if (this.isPolygon) {
      const centroid = getPolygonCenter(this.positions3D[0]);
      this.state.position = this.viewer.dataHelper.vector3ToSphericalCoords(centroid);
    } else {
      const centroid = getPolylineCenter(this.coords[0]);
      this.state.position = { yaw: centroid[0], pitch: centroid[1] };
    }

    this.state.positions3D = this.positions3D[0];
  }

  private __getAllPolyPositions(): Point[][] {
    return this.positions3D.map((positions) => {
      return this.__getPolyPositions(positions);
    });
  }

  /**
   * 计算多边形/折线每个点在查看器中的坐标<br>
   * 它会为相机背后的点创建适合投影器使用的中间点
   */
  private __getPolyPositions(positions: Vector3[]): Point[] {
    const nbVectors = positions.length;

    // 判断每个向量是否可见
    const positions3D = positions.map((vector) => {
      return {
        vector: vector,
        visible: vector.dot(this.viewer.state.direction) > 0,
      };
    });

    // 为每个连接到可见向量的不可见向量，收集可见/不可见向量对
    const toBeComputed: Array<{ visible: Vector3; invisible: Vector3; index: number }> = [];
    positions3D.forEach((pos, i) => {
      if (!pos.visible) {
        const neighbours = [
          i === 0 ? positions3D[nbVectors - 1] : positions3D[i - 1],
          i === nbVectors - 1 ? positions3D[0] : positions3D[i + 1],
        ];

        neighbours.forEach((neighbour) => {
          if (neighbour.visible) {
            toBeComputed.push({
              visible: neighbour.vector,
              invisible: pos.vector,
              index: i,
            });
          }
        });
      }
    });

    // 为每一对向量计算中间向量（反向循环以便 splice 插入到正确位置）
    toBeComputed.reverse().forEach((pair) => {
      positions3D.splice(pair.index, 0, {
        vector: getGreatCircleIntersection(pair.visible, pair.invisible, this.viewer.state.direction),
        visible: true,
      });
    });

    // 将向量转换为屏幕位置
    return positions3D
      .filter((pos) => pos.visible)
      .map((pos) => this.viewer.dataHelper.vector3ToViewerCoords(pos.vector));
  }
}

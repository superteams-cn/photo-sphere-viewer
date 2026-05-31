import { CONSTANTS, utils } from '@photo-sphere-viewer/core';
import { Vector3 } from 'three';

/**
 * 返回球面上两点之间的中间点
 * {@link http://www.movable-type.co.uk/scripts/latlong.html}
 */
function greatArcIntermediaryPoint(p1: [number, number], p2: [number, number], f: number): [number, number] {
  const [λ1, φ1] = p1;
  const [λ2, φ2] = p2;

  // 注意："r" 应为角距离，参见上文的 "intermediatePointTo"
  // but "greatArcDistance" gives identiqual results up to 0.00001 radians and is faster
  const r = utils.greatArcDistance(p1, p2);
  const a = Math.sin((1 - f) * r) / Math.sin(r);
  const b = Math.sin(f * r) / Math.sin(r);
  const x = a * Math.cos(φ1) * Math.cos(λ1) + b * Math.cos(φ2) * Math.cos(λ2);
  const y = a * Math.cos(φ1) * Math.sin(λ1) + b * Math.cos(φ2) * Math.sin(λ2);
  const z = a * Math.sin(φ1) + b * Math.sin(φ2);

  return [Math.atan2(y, x), Math.atan2(z, Math.sqrt(x * x + y * y))];
}

/**
 * Given a list of spherical points, offsets yaws in order to have only coutinuous values
 * eg: [0.2, 6.08] is transformed to [0.2, -0.2]
 */
function getPolygonCoherentPoints(points: Array<[number, number]>) {
  const workPoints = [points[0]];

  let k = 0;
  for (let i = 1; i < points.length; i++) {
    const d = points[i - 1][0] - points[i][0];
    if (d > Math.PI) {
      // 从左向右跨过原点
      k += 1;
    } else if (d < -Math.PI) {
      // 从右向左跨过原点
      k -= 1;
    }
    workPoints.push([points[i][0] + k * 2 * Math.PI, points[i][1]]);
  }

  return workPoints;
}

/**
 * 计算多边形中心点
 * @todo Get "visual center" (https://blog.mapbox.com/a-new-algorithm-for-finding-a-visual-center-of-a-polygon-7c77e6492fbc)
 * @internal
 */
export function getPolygonCenter(polygon: Vector3[]): Vector3 {
  return polygon.reduce((sum, point) => sum.add(point), new Vector3()).normalize();
}

/**
 * 计算折线中点
 * @internal
 */
export function getPolylineCenter(polyline: Array<[number, number]>): [number, number] {
  const points = getPolygonCoherentPoints(polyline);

  // compute each segment length + total length
  let length = 0;
  const lengths = [];

  for (let i = 0; i < points.length - 1; i++) {
    const l = utils.greatArcDistance(points[i], points[i + 1]) * CONSTANTS.SPHERE_RADIUS;

    lengths.push(l);
    length += l;
  }

  // iterate until length / 2
  let consumed = 0;

  for (let j = 0; j < points.length - 1; j++) {
    // 找到包含中点的线段后，计算对应的中间点
    if (consumed + lengths[j] > length / 2) {
      const r = (length / 2 - consumed) / lengths[j];
      return greatArcIntermediaryPoint(points[j], points[j + 1], r);
    }

    consumed += lengths[j];
  }

  // this never happens
  return points[Math.round(points.length / 2)];
}

const C = new Vector3();
const N = new Vector3();
const V = new Vector3();
const X = new Vector3();
const Y = new Vector3();
const A = new Vector3();

/**
 * 给定一个与相机同向的点和一个位于相机背后的点，
 * 计算相机可见半球边界大圆上的中间点。
 * 该点会偏移 .01 弧度，因为投影器无法处理恰好位于此圆上的点。
 * @todo：鱼眼视图下不可用（不能使用大圆）
 * @link http://math.stackexchange.com/a/1730410/327208
 */
export function getGreatCircleIntersection(P1: Vector3, P2: Vector3, direction: Vector3): Vector3 {
  C.copy(direction).normalize();
  N.crossVectors(P1, P2).normalize();
  V.crossVectors(N, P1).normalize();
  X.copy(P1).multiplyScalar(-C.dot(V));
  Y.copy(V).multiplyScalar(C.dot(P1));
  const H = new Vector3().addVectors(X, Y).normalize();
  A.crossVectors(H, C);
  return H.applyAxisAngle(A, 0.01).multiplyScalar(CONSTANTS.SPHERE_RADIUS);
}

import { Point, Position } from '../model';

/**
 * 通过回绕使数值保持在 0 到 `max` 范围内
 */
export function wrap(value: number, max: number): number {
  let result = value % max;

  if (result < 0) {
    result += max;
  }

  return result;
}

/**
 * 计算数组总和
 */
export function sum(array: number[]): number {
  return array.reduce((a, b) => a + b, 0);
}

/**
 * 计算两点之间的距离
 */
export function distance(p1: Point, p2: Point): number {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
}

/**
 * 计算两点之间的角度
 */
export function angle(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

/**
 * 计算球面上两个角度之间的最短偏移量
 */
export function getShortestArc(from: number, to: number): number {
  const candidates = [
    0, // 直接连接
    Math.PI * 2, // 顺时针跨过零点
    -Math.PI * 2, // 逆时针跨过零点
  ];

  return candidates.reduce((value, candidate) => {
    const newCandidate = to - from + candidate;
    return Math.abs(newCandidate) < Math.abs(value) ? newCandidate : value;
  }, Infinity);
}

/**
 * 计算当前位置与目标位置之间的角度
 */
export function getAngle(position1: Position, position2: Position): number {
  return Math.acos(
    Math.cos(position1.pitch) * Math.cos(position2.pitch) * Math.cos(position1.yaw - position2.yaw) +
      Math.sin(position1.pitch) * Math.sin(position2.pitch),
  );
}

/**
 * 返回单位球面上两点之间的距离
 * @see http://www.movable-type.co.uk/scripts/latlong.html
 */
export function greatArcDistance([yaw1, pitch1]: [number, number], [yaw2, pitch2]: [number, number]): number {
  // 当 yaw 差值大于 PI 时，偏移角度以仅考虑最短弧线
  if (yaw1 - yaw2 > Math.PI) {
    yaw1 -= 2 * Math.PI;
  } else if (yaw1 - yaw2 < -Math.PI) {
    yaw1 += 2 * Math.PI;
  }
  const x = (yaw2 - yaw1) * Math.cos((pitch1 + pitch2) / 2);
  const y = pitch2 - pitch1;
  return Math.sqrt(x * x + y * y);
}

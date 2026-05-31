import { PSVError } from '@photo-sphere-viewer/core';
import { Cubemap, CubemapFaces } from './model';

// PSV 面顺序为 left、front、right、back、top、bottom
// 3JS faces order is left, right, top, bottom, back, front
const CUBE_ARRAY = [0, 2, 4, 5, 3, 1];
const CUBE_HASHMAP: CubemapFaces[] = ['left', 'right', 'top', 'bottom', 'back', 'front'];

export function isCubemap(cubemap: any): cubemap is Cubemap {
  return cubemap && typeof cubemap === 'object' && CUBE_HASHMAP.every((side) => side in cubemap);
}

/**
 * 输入 PSV 顺序的 6 个对象数组，返回 3JS 顺序的数组
 */
export function cleanCubemapArray<T>(panorama: T[]): T[] {
  const cleanPanorama: T[] = [];

  if (panorama.length !== 6) {
    throw new PSVError('立方体贴图数组必须恰好包含 6 张图片。');
  }

  // 重新排列图片
  for (let i = 0; i < 6; i++) {
    cleanPanorama[i] = panorama[CUBE_ARRAY[i]];
  }

  return cleanPanorama;
}

/**
 * 输入以面名称为键的对象，返回 3JS 顺序的数组
 */
export function cleanCubemap<T>(cubemap: Record<CubemapFaces, T>): T[] {
  const cleanPanorama: T[] = [];

  if (!isCubemap(cubemap)) {
    throw new PSVError('立方体贴图对象必须恰好包含 left、front、right、back、top、bottom 六张图片。');
  }

  // 转换为数组
  CUBE_HASHMAP.forEach((side, i) => {
    cleanPanorama[i] = (cubemap as any)[side];
  });

  return cleanPanorama;
}

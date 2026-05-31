import { PSVError, Size, utils } from '@photo-sphere-viewer/core';
import { MathUtils } from 'three';
import { EquirectangularMultiTilesPanorama, EquirectangularTileLevel, EquirectangularTilesPanorama } from './model';

export type EquirectangularTileConfig = EquirectangularTileLevel & {
  level: number;
  colSize: number;
  rowSize: number;
  facesByCol: number;
  facesByRow: number;
};

function isMultiTiles(
  panorama: EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama,
): panorama is EquirectangularMultiTilesPanorama {
  return !!(panorama as EquirectangularMultiTilesPanorama).levels;
}

function computeTileConfig(
  tile: EquirectangularTileLevel,
  level: number,
  data: { SPHERE_SEGMENTS: number; SPHERE_HORIZONTAL_SEGMENTS: number },
): EquirectangularTileConfig {
  return {
    ...tile,
    level,
    colSize: tile.width / tile.cols,
    rowSize: tile.width / 2 / tile.rows,
    facesByCol: data.SPHERE_SEGMENTS / tile.cols,
    facesByRow: data.SPHERE_HORIZONTAL_SEGMENTS / tile.rows,
  };
}

export function getTileConfig(
  panorama: EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama,
  hFov: number,
  vFov: number,
  viewerSize: Size,
  data: { SPHERE_SEGMENTS: number; SPHERE_HORIZONTAL_SEGMENTS: number },
): EquirectangularTileConfig {
  let tile: EquirectangularTileLevel;
  let level: number;
  if (!isMultiTiles(panorama)) {
    level = 0;
    tile = { ...panorama };
  } else {
    if (viewerSize) {
      level = panorama.levels.findIndex((pLevel) => {
        const hResolution = (pLevel.width / 360) * hFov;
        const vResolution = (pLevel.width / 2 / 180) * vFov;
        return hResolution >= viewerSize.width && vResolution >= viewerSize.height;
      });
      if (level === -1) {
        level = panorama.levels.length - 1;
      }
    } else {
      level = 0;
    }
    tile = panorama.levels[level];
  }
  return computeTileConfig(tile, level, data);
}

export function getTileConfigByIndex(
  panorama: EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama,
  level: number,
  data: { SPHERE_SEGMENTS: number; SPHERE_HORIZONTAL_SEGMENTS: number },
): EquirectangularTileConfig {
  if (!isMultiTiles(panorama) || !panorama.levels[level]) {
    return null;
  } else {
    return computeTileConfig(panorama.levels[level], level, data);
  }
}

export function checkPanoramaConfig(
  panorama: EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama,
  data: { SPHERE_SEGMENTS: number; SPHERE_HORIZONTAL_SEGMENTS: number },
) {
  if (typeof panorama !== 'object' || !panorama.tileUrl) {
    throw new PSVError('无效的全景图配置，请确认是否使用了正确的适配器。');
  }
  if (isMultiTiles(panorama)) {
    panorama.levels.forEach((level) => {
      checkTile(level, data);
      if ('zoomRange' in level) {
        utils.logWarn('EquirectangularTilesAdapter："zoomRange" 属性已废弃，请移除。');
      }
    });
    panorama.levels.sort((a, b) => a.width - b.width);
  } else {
    checkTile(panorama, data);
  }
}

function checkTile(
  tile: EquirectangularTilesPanorama | EquirectangularTileLevel,
  data: { SPHERE_SEGMENTS: number; SPHERE_HORIZONTAL_SEGMENTS: number },
) {
  if (!tile.width || !tile.cols || !tile.rows) {
    throw new PSVError('无效的全景图配置，请确认是否使用了正确的适配器。');
  }
  if (tile.cols > data.SPHERE_SEGMENTS) {
    throw new PSVError(`全景图 cols 不能大于 ${data.SPHERE_SEGMENTS}。`);
  }
  if (tile.rows > data.SPHERE_HORIZONTAL_SEGMENTS) {
    throw new PSVError(`全景图 rows 不能大于 ${data.SPHERE_HORIZONTAL_SEGMENTS}。`);
  }
  if (!MathUtils.isPowerOfTwo(tile.cols) || !MathUtils.isPowerOfTwo(tile.rows)) {
    throw new PSVError('全景图 cols 与 rows 必须是 2 的幂。');
  }
}

/**
 * Returns a path used for cache key
 */
export function getCacheKey(
  panorama: EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama,
  firstTile: EquirectangularTileConfig,
): string {
  // some tiles might be "null"
  for (let i = 0; i < firstTile.cols; i++) {
    const url = panorama.tileUrl(i, firstTile.rows / 2, firstTile.level);
    if (url) {
      return url;
    }
  }

  return panorama.tileUrl.toString();
}

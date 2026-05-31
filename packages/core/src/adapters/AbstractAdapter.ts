import { Object3D } from 'three';
import { PSVError } from '../PSVError';
import type { Viewer } from '../Viewer';
import { PanoData, PanoDataProvider, PanoramaPosition, Position, TextureData } from '../model';
import { checkVersion } from '../utils';

/**
 * 适配器基类
 * @template TPanorama 全景图对象类型
 * @template TData 全景图元数据类型
 * @template TTexture 已加载纹理类型
 * @template TMesh 网格类型
 */
export abstract class AbstractAdapter<TPanorama, TData, TTexture, TMesh extends Object3D> {
  /**
   * 适配器的唯一标识符
   */
  static readonly id: string;
  /**
   * 期望的核心版本
   * 自定义适配器请勿使用
   */
  static readonly VERSION: string;

  /**
   * 表示适配器是否原生支持全景图下载
   */
  static readonly supportsDownload: boolean = false;

  constructor(protected readonly viewer: Viewer) {}

  /**
   * 初始化适配器
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init(): void {}

  /**
   * Destroys the adapter
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy(): void {}

  /**
   * Indicates if the adapter supports transitions between panoramas
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  supportsTransition(panorama: TPanorama): boolean {
    return false;
  }

  /**
   * Indicates if the adapter supports preload of a panorama
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  supportsPreload(panorama: TPanorama): boolean {
    return false;
  }

  /**
   * Converts pixel texture coordinates to spherical radians coordinates
   * @throws {@link PSVError} when the current adapter does not support texture coordinates
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  textureCoordsToSphericalCoords(point: PanoramaPosition, data: TData): Position {
    throw new PSVError('当前适配器不支持纹理坐标。');
  }

  /**
   * Converts spherical radians coordinates to pixel texture coordinates
   * @throws {@link PSVError} when the current adapter does not support texture coordinates
   */
  // @ts-ignore unused parameter
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sphericalCoordsToTextureCoords(position: Position, data: TData): PanoramaPosition {
    throw new PSVError('当前适配器不支持纹理坐标。');
  }

  /**
   * Loads the panorama texture
   */
  abstract loadTexture(
    panorama: TPanorama,
    loader?: boolean,
    newPanoData?: PanoData | PanoDataProvider,
    useXmpPanoData?: boolean,
  ): Promise<TextureData<TTexture, TPanorama, TData>>;

  /**
   * Creates the mesh
   */
  abstract createMesh(panoData: TData): TMesh;

  /**
   * Applies the texture to the mesh
   */
  abstract setTexture(mesh: TMesh, textureData: TextureData<TTexture, TPanorama, TData>, transition: boolean): void;

  /**
   * Changes the opacity of the mesh
   */
  abstract setTextureOpacity(mesh: TMesh, opacity: number): void;

  /**
   * Clear a loaded texture from memory
   */
  abstract disposeTexture(textureData: TextureData<TTexture, TPanorama, TData>): void;

  /**
   * Cleanup a mesh from memory
   */
  abstract disposeMesh(mesh: TMesh): void;
}

export type AdapterConstructor = new (viewer: Viewer, config?: any) => AbstractAdapter<any, any, any, any>;

/**
 * Returns the adapter constructor from the imported object
 * @internal
 */
export function adapterInterop(adapter: any): AdapterConstructor & typeof AbstractAdapter {
  if (adapter) {
    for (const [, p] of [['_', adapter], ...Object.entries(adapter)]) {
      if (p.prototype instanceof AbstractAdapter) {
        checkVersion(p.id, p.VERSION, PKG_VERSION);
        return p;
      }
    }
  }
  return null;
}

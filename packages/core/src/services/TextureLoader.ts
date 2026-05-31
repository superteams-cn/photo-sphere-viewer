import { FileLoader } from 'three';
import { PSVError } from '../PSVError';
import type { Viewer } from '../Viewer';
import { Cache } from '../data/cache';
import { LoadProgressEvent } from '../events';
import { AbortableImageLoader } from '../lib/ImageLoader';
import { AbstractService } from './AbstractService';

/**
 * 图片与纹理加载系统
 */
export class TextureLoader extends AbstractService {
  private readonly fileLoader: FileLoader;
  private readonly imageLoader: AbortableImageLoader;

  /**
   * @internal
   */
  constructor(viewer: Viewer) {
    super(viewer);

    this.fileLoader = new FileLoader();
    this.fileLoader.setResponseType('blob');
    this.imageLoader = new AbortableImageLoader();
  }

  /**
   * @internal
   */
  override destroy() {
    this.abortLoading();
    super.destroy();
  }

  /**
   * 取消当前 HTTP 请求
   * @internal
   */
  abortLoading() {
    this.fileLoader.abort?.();
    this.imageLoader.abort();
  }

  /**
   * 使用 FileLoader 加载 Blob
   */
  loadFile(url: string, onProgress?: (p: number) => void, cacheKey?: string): Promise<Blob> {
    const cached = Cache.get(url, cacheKey);

    if (cached) {
      if (cached instanceof Blob) {
        onProgress?.(100);
        return Promise.resolve(cached);
      } else {
        // 罕见情况：图片已经通过 ImageLoader 加载
        Cache.remove(url, cacheKey);
      }
    }

    if (this.config.requestHeaders) {
      this.fileLoader.setRequestHeader(this.config.requestHeaders(url));
    }

    this.fileLoader.setWithCredentials(this.config.withCredentials(url));

    let progress = 0;
    onProgress?.(progress);

    return this.fileLoader
      .loadAsync(url, (e) => {
        if (e.lengthComputable) {
          const newProgress = (e.loaded / e.total) * 100;
          if (newProgress > progress) {
            progress = newProgress;
            onProgress?.(progress);
          }
        }
      })
      .then((result) => {
        progress = 100;
        onProgress?.(progress);
        Cache.add(url, cacheKey, result as any as Blob);
        return result as any as Blob;
      });
  }

  /**
   * 使用 ImageLoader 加载图片；如果需要进度或请求头，则使用 FileLoader
   */
  loadImage(url: string, onProgress?: (p: number) => void, cacheKey?: string): Promise<HTMLImageElement> {
    const cached = Cache.get(url, cacheKey);

    if (cached) {
      onProgress?.(100);
      if (cached instanceof Blob) {
        // 罕见情况：图片已经通过 FileLoader 加载
        return this.blobToImage(cached);
      } else {
        return Promise.resolve(cached);
      }
    }

    if (!onProgress && !this.config.requestHeaders) {
      this.imageLoader.setWithCredentials(this.config.withCredentials(url));

      return this.imageLoader.loadAsync(url).then((result) => {
        Cache.add(url, cacheKey, result);
        return result;
      });
    } else {
      return this.loadFile(url, onProgress, cacheKey).then((blob) => this.blobToImage(blob));
    }
  }

  /**
   * 将通过 {@link loadFile} 加载的文件转换为图片
   */
  blobToImage(blob: Blob): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = document.createElement('img');
      img.onload = () => {
        URL.revokeObjectURL(img.src);
        resolve(img);
      };
      img.onerror = reject;
      img.src = URL.createObjectURL(blob);
    });
  }

  /**
   * 预加载全景图文件，但不显示
   */
  preloadPanorama(panorama: any): Promise<unknown> {
    if (this.viewer.adapter.supportsPreload(panorama)) {
      return this.viewer.adapter.loadTexture(panorama, false);
    } else {
      return Promise.reject(new PSVError('当前适配器不支持预加载。'));
    }
  }

  /**
   * @internal
   */
  dispatchProgress(progress: number) {
    this.viewer.loader.setProgress(progress);
    this.viewer.dispatchEvent(new LoadProgressEvent(Math.round(progress)));
  }
}

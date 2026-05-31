import { ImageLoader } from 'three';

/**
 * 可中止的 Three.js ImageLoader
 */
export class AbortableImageLoader extends ImageLoader {
  private _abortController = new AbortController();

  override abort() {
    this._abortController.abort();
    this._abortController = new AbortController();
    return this;
  }

  override load(
    url: string,
    onLoad: (data: HTMLImageElement) => void,
    onProgress: (event: ProgressEvent) => void,
    onError: (err: unknown) => void,
  ) {
    const abortSignal = this._abortController.signal;

    const image = super.load(
      url,
      (data) => {
        removeEventListeners();
        onLoad(data);
      },
      onProgress,
      (error) => {
        removeEventListeners();

        if (abortSignal.aborted) {
          // 模拟 Fetch API 抛出的 DOMException
          // （DOMException 不能直接实例化）
          const e = new Error();
          e.name = 'AbortError';
          e.message = '操作已中止。';
          onError(e);
        } else {
          onError(error);
        }
      },
    );

    function onAbortSignal() {
      image.src = '';
    }

    function removeEventListeners() {
      abortSignal.removeEventListener('abort', onAbortSignal, false);
    }

    abortSignal.addEventListener('abort', onAbortSignal, false);

    return image;
  }
}

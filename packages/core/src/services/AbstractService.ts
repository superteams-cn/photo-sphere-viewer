import { ParsedViewerConfig } from '../model';
import type { Viewer } from '../Viewer';
import { ViewerState } from './ViewerState';

/**
 * 服务基类
 */
export abstract class AbstractService {
  protected readonly config: ParsedViewerConfig;
  protected readonly state: ViewerState;

  /**
   * @internal
   */
  constructor(protected readonly viewer: Viewer) {
    this.config = viewer.config;
    this.state = viewer.state;
  }

  /**
   * 销毁服务
   * @internal
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {}
}

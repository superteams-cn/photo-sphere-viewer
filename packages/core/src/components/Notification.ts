import { PSVError } from '../PSVError';
import type { Viewer } from '../Viewer';
import { HideNotificationEvent, ShowNotificationEvent } from '../events';
import { AbstractComponent } from './AbstractComponent';

/**
 * {@link Notification.show} 的配置
 */
export type NotificationConfig = {
  /**
   * 唯一标识符，用于 {@link Notification.hide} 和 {@link Notification.isVisible}
   */
  id?: string;
  /**
   * 通知内容
   */
  content: string;
  /**
   * X 毫秒后自动隐藏通知
   */
  timeout?: number;
};

/**
 * 通知组件
 */
export class Notification extends AbstractComponent {
  /**
   * @internal
   */
  protected override readonly state = {
    visible: false,
    contentId: null as string,
    timeout: null as ReturnType<typeof setTimeout>,
  };

  private readonly content: HTMLElement;

  /**
   * @internal
   */
  constructor(viewer: Viewer) {
    super(viewer, {
      className: 'psv-notification',
    });

    this.content = document.createElement('div');
    this.content.className = 'psv-notification-content';
    this.container.appendChild(this.content);

    this.content.addEventListener('click', () => this.hide());
  }

  /**
   * 检查通知是否可见
   */
  override isVisible(id?: string) {
    return this.state.visible && (!id || !this.state.contentId || this.state.contentId === id);
  }

  /**
   * @throws {@link Core.PSVError | PSVError} 始终抛出
   * @internal
   */
  override toggle() {
    throw new PSVError('通知不能切换显示状态。');
  }

  /**
   * 在查看器上显示通知
   *
   * @example
   * viewer.showNotification({ content: 'Hello world', timeout: 5000 })
   * @example
   * viewer.showNotification('Hello world')
   */
  override show(config: string | NotificationConfig) {
    if (this.state.timeout) {
      clearTimeout(this.state.timeout);
      this.state.timeout = null;
    }

    if (typeof config === 'string') {
      config = { content: config };
    }

    this.state.contentId = config.id || null;
    this.content.innerHTML = config.content;

    this.container.classList.add('psv-notification--visible');
    this.state.visible = true;

    this.viewer.dispatchEvent(new ShowNotificationEvent(this.state.contentId));

    if (config.timeout) {
      this.state.timeout = setTimeout(() => this.hide(this.state.contentId), config.timeout);
    }
  }

  /**
   * 隐藏通知
   */
  override hide(id?: string) {
    if (this.isVisible(id)) {
      const contentId = this.state.contentId;

      this.container.classList.remove('psv-notification--visible');
      this.state.visible = false;

      this.state.contentId = null;

      this.viewer.dispatchEvent(new HideNotificationEvent(contentId));
    }
  }
}

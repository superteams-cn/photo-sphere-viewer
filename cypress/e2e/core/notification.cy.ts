import { type Notification } from '@photo-sphere-viewer/core';
import { callViewer, checkEventHandler, listenViewerEvent, waitViewerReady } from '../../utils';
import { NO_LOG } from '../../utils/constants';

describe('核心：通知', () => {
  beforeEach(() => {
    cy.visit('e2e/core/base.html');
    waitViewerReady();
  });

  it('应能显示和隐藏通知', () => {
    const showNotificationHandler = listenViewerEvent('show-notification');
    const hideNotificationHandler = listenViewerEvent('hide-notification');

    callNotification('显示通知').then((notification) => notification.show('内容'));
    checkEventHandler(showNotificationHandler, { notificationId: null });
    checkNotificationVisibleApi(true);
    cy.get('.psv-notification').should('be.visible').should('have.class', 'psv-notification--visible');

    callNotification('隐藏通知').then((notification) => notification.hide());
    checkEventHandler(hideNotificationHandler, { notificationId: null });
    checkNotificationVisibleApi(false);
    cy.get('.psv-notification').should('not.be.visible').should('not.have.class', 'psv-notification--visible');
  });

  it('点击时应隐藏', () => {
    callNotification('显示通知').then((notification) => notification.show('内容'));
    cy.get('.psv-notification').should('be.visible');

    cy.get('.psv-notification').click();
    cy.get('.psv-notification').should('not.be.visible');
  });

  it('应能显示带 id 的通知', () => {
    const showNotificationHandler = listenViewerEvent('show-notification');
    const hideNotificationHandler = listenViewerEvent('hide-notification');

    callNotification('显示通知 a').then((notification) =>
      notification.show({
        content: '内容',
        id: 'notification-a',
      }),
    );
    checkEventHandler(showNotificationHandler, { notificationId: 'notification-a' });
    checkNotificationVisibleApi(true);
    checkNotificationVisibleApi(true, 'notification-a');
    checkNotificationVisibleApi(false, 'notification-b');

    callNotification('隐藏通知 b').then((notification) => notification.hide('notification-b'));
    cy.wrap(hideNotificationHandler, NO_LOG).should('not.have.been.called');
    checkNotificationVisibleApi(true, 'notification-a');
    cy.get('.psv-notification').should('be.visible');

    callNotification('隐藏通知 a').then((notification) => notification.hide('notification-a'));
    checkEventHandler(hideNotificationHandler, { notificationId: 'notification-a' });
    checkNotificationVisibleApi(false, 'notification-a');

    callNotification('显示通知 b').then((notification) =>
      notification.show({
        content: '标题',
        id: 'notification-b',
      }),
    );
    checkEventHandler(showNotificationHandler, { notificationId: 'notification-b' });
    checkNotificationVisibleApi(true, 'notification-b');

    callNotification('隐藏任意通知').then((panel) => panel.hide());
    checkEventHandler(hideNotificationHandler, { notificationId: 'notification-b' });
    checkNotificationVisibleApi(false);
  });

  it('超时后应隐藏', () => {
    cy.clock();

    callNotification('显示通知').then((notification) =>
      notification.show({
        content: '内容',
        timeout: 2000,
      }),
    );
    cy.get('.psv-notification').should('be.visible');

    cy.tick(1000);
    cy.get('.psv-notification').should('be.visible');

    cy.tick(1000);
    cy.get('.psv-notification').should('not.be.visible');
  });

  function callNotification(log: string): Cypress.Chainable<Notification> {
    return callViewer(log).then((viewer) => viewer.notification);
  }

  function checkNotificationVisibleApi(visible: boolean, id?: string) {
    callNotification(`检查${id ? `通知 "${id}"` : '任意通知'}是否${visible ? '可见' : '不可见'}`).then(
      (notification) => {
        expect(notification.isVisible(id)).to.eq(visible);
      },
    );
  }
});

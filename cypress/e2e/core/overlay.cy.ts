import { type Overlay } from '@photo-sphere-viewer/core';
import { callViewer, checkEventHandler, listenViewerEvent, triggerWindowKeydown, waitViewerReady } from '../../utils';
import { NO_LOG, VIEWPORT_MOBILE } from '../../utils/constants';

describe('核心：覆盖层', () => {
  beforeEach(() => {
    cy.visit('e2e/core/base.html');
    waitViewerReady();
  });

  it('应能显示和隐藏覆盖层', () => {
    const showOverlayHandler = listenViewerEvent('show-overlay');
    const hideOverlayHandler = listenViewerEvent('hide-overlay');

    callOverlay('显示覆盖层').then((overlay) => overlay.show('标题'));
    checkEventHandler(showOverlayHandler, { overlayId: null });
    checkOverlayVisibleApi(true);
    cy.get('.psv-overlay').should('be.visible');

    callOverlay('隐藏覆盖层').then((overlay) => overlay.hide());
    checkEventHandler(hideOverlayHandler, { overlayId: null });
    checkOverlayVisibleApi(false);
    cy.get('.psv-overlay').should('not.be.visible');
  });

  it('点击或按 Esc 时应隐藏', () => {
    callOverlay('显示覆盖层').then((overlay) => overlay.show('标题'));
    cy.get('.psv-overlay').should('be.visible');

    cy.get('.psv-overlay').click();
    cy.get('.psv-overlay').should('not.be.visible');

    callOverlay('显示覆盖层').then((overlay) => overlay.show('标题'));
    cy.get('.psv-overlay').should('be.visible');

    triggerWindowKeydown('Escape');
    cy.get('.psv-overlay').should('not.be.visible');
  });

  it('应能禁止关闭', () => {
    callOverlay('显示覆盖层').then((overlay) =>
      overlay.show({
        title: '标题',
        dismissible: false,
      }),
    );

    cy.get('.psv-overlay').click();
    cy.get('.psv-overlay').should('be.visible');

    triggerWindowKeydown('Escape');
    cy.get('.psv-overlay').should('be.visible');
  });

  it('应能显示带 id 的覆盖层', () => {
    const showOverlayHandler = listenViewerEvent('show-overlay');
    const hideOverlayHandler = listenViewerEvent('hide-overlay');

    callOverlay('显示覆盖层 a').then((overlay) =>
      overlay.show({
        title: '标题',
        id: 'overlay-a',
      }),
    );
    checkEventHandler(showOverlayHandler, { overlayId: 'overlay-a' });
    checkOverlayVisibleApi(true);
    checkOverlayVisibleApi(true, 'overlay-a');
    checkOverlayVisibleApi(false, 'overlay-b');

    callOverlay('隐藏覆盖层 b').then((overlay) => overlay.hide('overlay-b'));
    cy.wrap(hideOverlayHandler, NO_LOG).should('not.have.been.called');
    checkOverlayVisibleApi(true, 'overlay-a');
    cy.get('.psv-overlay').should('be.visible');

    callOverlay('隐藏覆盖层 a').then((overlay) => overlay.hide('overlay-a'));
    checkEventHandler(hideOverlayHandler, { overlayId: 'overlay-a' });
    checkOverlayVisibleApi(false, 'overlay-a');

    callOverlay('显示覆盖层 b').then((overlay) =>
      overlay.show({
        title: '标题',
        id: 'overlay-b',
      }),
    );
    checkEventHandler(showOverlayHandler, { overlayId: 'overlay-b' });
    checkOverlayVisibleApi(true, 'overlay-b');

    callOverlay('隐藏任意覆盖层').then((panel) => panel.hide());
    checkEventHandler(hideOverlayHandler, { overlayId: 'overlay-b' });
    checkOverlayVisibleApi(false);
  });

  it('应显示标题、文本和图片', () => {
    callOverlay('显示覆盖层').then((overlay) =>
      overlay.show({
        title: '欢迎',
        text: '这是演示内容',
        image: '<img src=https://photo-sphere-viewer.js.org/favicon.png>',
      }),
    );

    cy.waitForResources('favicon.png');

    cy.get('.psv-overlay').compareScreenshots('desktop');

    cy.viewport(VIEWPORT_MOBILE.viewportWidth, VIEWPORT_MOBILE.viewportHeight);

    cy.get('.psv-overlay').compareScreenshots('mobile');
  });

  function callOverlay(log: string): Cypress.Chainable<Overlay> {
    return callViewer(log).then((viewer) => viewer.overlay);
  }

  function checkOverlayVisibleApi(visible: boolean, id?: string) {
    callOverlay(`检查${id ? `覆盖层 "${id}"` : '任意覆盖层'}是否${visible ? '可见' : '不可见'}`).then((overlay) => {
      expect(overlay.isVisible(id)).to.eq(visible);
    });
  }
});

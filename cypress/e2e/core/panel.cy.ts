import { type Panel } from '@photo-sphere-viewer/core';
import { callViewer, checkEventHandler, listenViewerEvent, triggerWindowKeydown, waitViewerReady } from '../../utils';
import { NO_LOG, VIEWPORT_MOBILE } from '../../utils/constants';

describe('核心：面板', () => {
  beforeEach(() => {
    cy.visit('e2e/core/base.html');
    waitViewerReady();
  });

  it('应能显示和隐藏面板', () => {
    const showPanelHandler = listenViewerEvent('show-panel');
    const hidePanelHandler = listenViewerEvent('hide-panel');

    callPanel('显示面板').then((panel) => panel.show('内容'));
    checkEventHandler(showPanelHandler, { panelId: null });
    checkPanelVisibleApi(true);
    cy.get('.psv-panel').should('be.visible').should('have.class', 'psv-panel--open');

    callPanel('隐藏面板').then((panel) => panel.hide());
    checkEventHandler(hidePanelHandler, { panelId: null });
    checkPanelVisibleApi(false);
    cy.get('.psv-panel').should('not.be.visible').should('not.have.class', 'psv-panel--open');
  });

  it('点击关闭按钮或按 Esc 时应隐藏', () => {
    callPanel('显示面板').then((panel) => panel.show('内容'));
    cy.get('.psv-panel').should('be.visible');

    cy.get('.psv-panel-close-button').should('have.attr', 'title', '关闭').click();
    cy.get('.psv-panel').should('not.be.visible');

    callPanel('显示面板').then((panel) => panel.show('内容'));
    cy.get('.psv-panel').should('be.visible');

    triggerWindowKeydown('Escape');
    cy.get('.psv-panel').should('not.be.visible');
  });

  it('应能显示带 id 的面板', () => {
    const showPanelHandler = listenViewerEvent('show-panel');
    const hidePanelHandler = listenViewerEvent('hide-panel');

    callPanel('显示面板 a').then((panel) =>
      panel.show({
        content: '内容',
        id: 'panel-a',
      }),
    );
    checkEventHandler(showPanelHandler, { panelId: 'panel-a' });
    checkPanelVisibleApi(true);
    checkPanelVisibleApi(true, 'panel-a');
    checkPanelVisibleApi(false, 'panel-b');

    callPanel('隐藏面板 b').then((panel) => panel.hide('panel-b'));
    cy.wrap(hidePanelHandler, NO_LOG).should('not.have.been.called');
    checkPanelVisibleApi(true, 'panel-a');
    cy.get('.psv-panel').should('be.visible');

    callPanel('隐藏面板 a').then((panel) => panel.hide('panel-a'));
    checkEventHandler(hidePanelHandler, { panelId: 'panel-a' });
    checkPanelVisibleApi(false, 'panel-a');

    callPanel('显示面板 b').then((panel) =>
      panel.show({
        content: '内容',
        id: 'panel-b',
      }),
    );
    checkEventHandler(showPanelHandler, { panelId: 'panel-b' });
    checkPanelVisibleApi(true, 'panel-b');

    callPanel('隐藏任意面板').then((panel) => panel.hide());
    checkEventHandler(hidePanelHandler, { panelId: 'panel-b' });
    checkPanelVisibleApi(false);
  });

  it('应按指定宽度显示', () => {
    callPanel('显示面板').then((panel) =>
      panel.show({
        content: '内容',
        width: '50%',
      }),
    );

    checkPanelWidth(640);
  });

  it('应能调整尺寸并保存宽度', () => {
    callPanel('显示面板 a').then((panel) =>
      panel.show({
        content: '内容',
        id: 'panel-a',
      }),
    );
    checkPanelWidth(400);

    cy.get('.psv-panel-resizer').trigger('mousedown', { clientX: 875, clientY: 450 });
    cy.get('.psv-container')
      .trigger('mousemove', { clientX: 825, clientY: 450 })
      .trigger('mousemove', { clientX: 775, clientY: 450 })
      .trigger('mousemove', { clientX: 725, clientY: 450 })
      .trigger('mousemove', { clientX: 675, clientY: 450 })
      .trigger('mouseup');
    checkPanelWidth(600);

    callPanel('隐藏面板').then((panel) => panel.hide());

    callPanel('显示面板 a').then((panel) =>
      panel.show({
        content: '内容',
        id: 'panel-a',
      }),
    );
    checkPanelWidth(600);

    callPanel('隐藏面板').then((panel) => panel.hide());

    callPanel('显示面板 b').then((panel) =>
      panel.show({
        content: '内容',
        id: 'panel-b',
      }),
    );
    checkPanelWidth(400);
  });

  it('移动端不应允许调整尺寸', VIEWPORT_MOBILE, () => {
    callPanel('显示面板').then((panel) => panel.show('内容'));

    cy.get('.psv-panel').should((panel) => {
      const { x, y, width, height } = panel[0].getBoundingClientRect();
      expect({ x, y, width, height }).to.deep.eq({ x: 0, y: 0, width: 400, height: 760 });
    });

    cy.get('.psv-panel-resizer').should('not.be.visible');
  });

  it('应使用自定义点击处理器', () => {
    const clickHandler = cy.stub();

    callPanel('显示面板').then((panel) =>
      panel.show({
        content: '<button id="my-btn">点击</button>',
        clickHandler: clickHandler,
      }),
    );

    cy.get('#my-btn').should('be.focused').click();

    cy.wrap(clickHandler, NO_LOG)
      .should('have.been.called')
      .should(() => {
        const target = clickHandler.getCall(0).args[0] as HTMLElement;
        expect(target).to.have.attr('id', 'my-btn');
      });

    cy.get('#my-btn').focus().trigger('keydown', { key: 'Enter' });

    cy.wrap(clickHandler, NO_LOG).should('have.been.calledTwice');
  });

  function callPanel(log: string): Cypress.Chainable<Panel> {
    return callViewer(log).then((viewer) => viewer.panel);
  }

  function checkPanelVisibleApi(visible: boolean, id?: string) {
    callPanel(`检查${id ? `面板 "${id}"` : '任意面板'}是否${visible ? '可见' : '不可见'}`).then((panel) => {
      expect(panel.isVisible(id)).to.eq(visible);
    });
  }

  function checkPanelWidth(width: number) {
    cy.log(`检查面板宽度为 ${width}px`);
    cy.get('.psv-panel').should((element) => {
      expect(element[0].offsetWidth).to.be.equal(width);
    });
  }
});

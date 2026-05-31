import { type Navbar } from '@photo-sphere-viewer/core';
import { callViewer, waitViewerReady } from '../../utils';
import { VIEWPORT_MOBILE } from '../../utils/constants';

describe('核心：导航栏', () => {
  beforeEach(() => {
    localStorage.photoSphereViewer_touchSupport = 'false';
    cy.visit('e2e/core/navbar.html');
    waitViewerReady();
  });

  it('应显示导航栏', () => {
    cy.get('.psv-navbar').should('be.visible').compareScreenshots('base');
  });

  it('应支持自定义按钮', () => {
    const alertStub = cy.stub();
    cy.on('window:alert', alertStub);

    cy.get('.custom-button:eq(0)')
      .click()
      .then(() => {
        expect(alertStub.getCall(0)).to.be.calledWith('自定义按钮已点击');
      });
  });

  it('应能更新标题', () => {
    cy.get('.psv-caption-content').should('have.text', '梅康图尔国家公园 © Damien Sorel');

    callViewer('通过选项修改标题').then((viewer) => viewer.setOption('caption', '<strong>名称：</strong>中文示例'));

    cy.get('.psv-caption-content').should('have.text', '名称：中文示例');

    cy.get('.psv-navbar').compareScreenshots('update-caption');

    callNavbar('通过 API 修改标题').then((navbar) => navbar.setCaption('加载中...'));

    cy.get('.psv-caption-content').should('have.text', '加载中...');
  });

  it('应在侧边面板中显示说明', () => {
    cy.get('.psv-description-button').click();

    cy.get('.psv-panel')
      .should('be.visible')
      .should('include.text', '梅康图尔国家公园 © Damien Sorel')
      .should('include.text', '这是一段中文说明内容，用于验证说明面板的展示效果')
      .compareScreenshots('description');

    cy.get('.psv-description-button').click();

    cy.get('.psv-panel').should('not.be.visible');

    callViewer('清空说明').then((viewer) => viewer.setOption('description', null));

    cy.get('.psv-description-button').should('not.be.visible');
  });

  it(
    '空间不足时应隐藏标题',
    {
      viewportWidth: 800,
      viewportHeight: 900,
    },
    () => {
      callViewer('移除说明').then((viewer) => viewer.setOption('description', null));

      cy.get('.psv-caption-content').should('not.be.visible');

      cy.get('.psv-navbar').compareScreenshots('no-caption');

      cy.get('.psv-description-button').click();

      cy.get('.psv-notification-content')
        .should('be.visible')
        .should('have.text', '梅康图尔国家公园 © Damien Sorel')
        .compareScreenshots('caption-notification', { errorThreshold: 0.1 });

      cy.get('.psv-description-button').click();

      cy.get('.psv-notification').should('not.be.visible');
    },
  );

  it('小屏幕上应显示菜单', VIEWPORT_MOBILE, () => {
    ['.psv-caption-content', '.psv-zoom-range', '.psv-download-button', '.custom-button:eq(0)'].forEach((invisible) => {
      cy.get(invisible).should('not.be.visible');
    });

    [
      '.psv-zoom-button',
      '.psv-move-button',
      '.psv-description-button',
      '.psv-fullscreen-button',
      '.psv-menu-button',
      '.custom-button:eq(1)',
    ].forEach((visible) => {
      cy.get(visible).should('be.visible');
    });

    cy.get('.psv-navbar').compareScreenshots('with-menu');

    cy.get('.psv-menu-button').click();

    cy.get('.psv-panel')
      .should('be.visible')
      .within(() => {
        cy.get('.psv-panel-menu-title').should('contain.text', '菜单');

        cy.contains('下载').should('be.visible');
        cy.contains('点我').should('be.visible');
      })
      .compareScreenshots('menu-content');

    cy.get('.psv-panel-close-button').click();

    cy.get('.psv-panel').should('not.be.visible');
  });

  it('应能翻译按钮', () => {
    function assertTitles(titles: any) {
      cy.get('.psv-zoom-button:eq(0)').invoke('attr', 'title').should('eq', titles.zoomOut);
      cy.get('.psv-zoom-button:eq(1)').invoke('attr', 'title').should('eq', titles.zoomIn);
      cy.get('.psv-move-button:eq(0)').invoke('attr', 'title').should('eq', titles.moveLeft);
      cy.get('.psv-move-button:eq(1)').invoke('attr', 'title').should('eq', titles.moveRight);
      cy.get('.psv-move-button:eq(2)').invoke('attr', 'title').should('eq', titles.moveUp);
      cy.get('.psv-move-button:eq(3)').invoke('attr', 'title').should('eq', titles.moveDown);
      cy.get('.psv-download-button').invoke('attr', 'title').should('eq', titles.download);
      cy.get('.psv-description-button').invoke('attr', 'title').should('eq', titles.description);
      cy.get('.psv-fullscreen-button').invoke('attr', 'title').should('eq', titles.fullscreen);
      cy.get('.custom-button:eq(0)').invoke('attr', 'title').should('eq', titles.myButton);
    }

    const zh = {
      zoomOut: '缩小',
      zoomIn: '放大',
      moveUp: '向上移动',
      moveDown: '向下移动',
      moveLeft: '向左移动',
      moveRight: '向右移动',
      description: '说明',
      download: '下载',
      fullscreen: '全屏',
      myButton: '点我',
    };
    assertTitles(zh);

    const fr = {
      zoomOut: 'Dézoomer',
      zoomIn: 'Zoomer',
      moveUp: 'Haut',
      moveDown: 'Bas',
      moveLeft: 'Gauche',
      moveRight: 'Droite',
      description: '说明',
      download: 'Télécharger',
      fullscreen: 'Plein écran',
      myButton: 'Cliquez ici',
    };
    callViewer('切换为法语').then((viewer) => viewer.setOption('lang', fr));

    assertTitles(fr);
  });

  it('应能隐藏导航栏', () => {
    callNavbar('隐藏导航栏').then((navbar) => navbar.hide());
    checkNavbarVisibleApi(false);
    cy.get('.psv-navbar').should('not.be.visible').should('not.have.class', 'psv-navbar--open');
    cy.get('.psv-container').should('not.have.class', 'psv--has-navbar');

    callNavbar('显示导航栏').then((navbar) => navbar.show());
    checkNavbarVisibleApi(true);
    cy.get('.psv-navbar').should('be.visible').should('have.class', 'psv-navbar--open');
    cy.get('.psv-container').should('have.class', 'psv--has-navbar');
  });

  it('应能更新按钮', () => {
    function assertButtons(expected: string[]) {
      cy.get('.psv-button').then(($buttons) => {
        const titles = $buttons
          .filter(':visible')
          .map((i, btn) => btn.getAttribute('title'))
          .get();
        expect(titles).to.have.members(expected);
      });
    }

    callViewer('通过选项修改按钮').then((viewer) => viewer.setOption('navbar', 'zoom move'));

    assertButtons(['缩小', '放大', '向左移动', '向右移动', '向上移动', '向下移动']);

    cy.get('.psv-navbar').compareScreenshots('update-buttons');

    callNavbar('通过 API 修改按钮').then((navbar) => navbar.setButtons(['download', 'fullscreen']));

    assertButtons(['下载', '全屏']);
  });

  it('应能隐藏按钮', () => {
    callNavbar('隐藏全屏按钮').then((navbar) => navbar.getButton('fullscreen').hide());

    cy.get('.psv-fullscreen-button').should('not.be.visible');

    cy.get('.psv-navbar').compareScreenshots('hide-button');

    callNavbar('显示全屏按钮').then((navbar) => navbar.getButton('fullscreen').show());

    cy.get('.psv-fullscreen-button').should('be.visible');
  });

  it('应能禁用按钮', () => {
    callNavbar('禁用下载按钮').then((navbar) => navbar.getButton('download').disable());

    cy.get('.psv-download-button').should('have.class', 'psv-button--disabled');

    cy.get('.psv-navbar').compareScreenshots('disable-button');

    callNavbar('启用下载按钮').then((navbar) => navbar.getButton('download').enable());

    cy.get('.psv-download-button').should('not.have.class', 'psv-button--disabled');
  });

  it('应显示自定义元素', () => {
    cy.document().then((document) => {
      callNavbar('设置自定义元素').then((navbar) =>
        navbar.setButtons([
          {
            content: document.createElement('custom-navbar-button'),
          },
        ]),
      );
    });

    cy.get('.psv-custom-button')
      .should('have.class', 'psv-custom-button--no-padding')
      .find('custom-navbar-button')
      .shadow()
      .within(() => {
        cy.get('#title').should('have.text', '自定义元素');
        cy.get('#value').should('have.text', '50');
      });

    cy.get('.psv-custom-button').compareScreenshots('custom-element');
  });

  function callNavbar(log: string): Cypress.Chainable<Navbar> {
    return callViewer(log).then((viewer) => viewer.navbar);
  }

  function checkNavbarVisibleApi(visible: boolean) {
    callNavbar(`检查导航栏是否${visible ? '可见' : '不可见'}`).then((navbar) => {
      expect(navbar.isVisible()).to.eq(visible);
    });
  }
});

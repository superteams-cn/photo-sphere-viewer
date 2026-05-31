import type { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import { callPlugin, callViewer, checkPanorama, setPanorama, waitViewerReady } from '../../utils';
import { BASE_URL, NO_LOG, VIEWPORT_MOBILE } from '../../utils/constants';

describe('插件：图库', () => {
  beforeEach(() => {
    cy.visit('e2e/plugins/gallery.html');
    waitViewerReady();
    cy.waitForResources(
      'key-biscayne-1-thumb.jpg',
      'key-biscayne-2-thumb.jpg',
      'key-biscayne-3-thumb.jpg',
      'key-biscayne-4-thumb.jpg',
    );
  });

  it('应能销毁查看器', () => {
    callViewer('销毁').then((viewer) => viewer.destroy());
  });

  it('应显示图库', () => {
    cy.get('.psv-gallery').should('be.visible').compareScreenshots('base');
  });

  it('打开面板时应隐藏图库', () => {
    callViewer('打开面板').then((viewer) => viewer.panel.show('中文内容'));

    cy.get('.psv-gallery').should('not.be.visible');
  });

  it('应能横向滚动', () => {
    cy.get('.psv-gallery')
      .trigger('wheel', { deltaY: 1 })
      .trigger('wheel', { deltaY: 1 })
      .trigger('wheel', { deltaY: 1 })
      .trigger('wheel', { deltaY: 1 });

    waitForAllThumbnails();

    cy.get('.psv-gallery').compareScreenshots('scroll-pan');
  });

  it('应支持点击拖动', () => {
    cy.get('.psv-gallery')
      .trigger('mousedown', { clientX: 1200 })
      .trigger('mousemove', { clientX: 100 })
      .trigger('mouseup');

    waitForAllThumbnails();

    cy.get('.psv-gallery').compareScreenshots('scroll-pan');
  });

  it('在移动端应全屏显示', VIEWPORT_MOBILE, () => {
    waitForAllThumbnails();

    cy.get('.psv-gallery').should((gallery) => {
      const { x, y, width, height } = gallery[0].getBoundingClientRect();
      expect({ x, y, width, height }).to.deep.eq({ x: 0, y: 0, width: 400, height: 760 });
    });

    cy.get('.psv-gallery').compareScreenshots('mobile');

    cy.get('.psv-gallery .psv-panel-close-button').click();

    cy.get('.psv-gallery').should('not.be.visible');
  });

  it('应添加导航栏按钮', () => {
    cy.get('.psv-gallery-button')
      .should('be.visible')
      .should('have.class', 'psv-button--active')
      .click()
      .should('not.have.class', 'psv-button--active');

    cy.get('.psv-gallery').should('not.be.visible');

    cy.get('.psv-gallery-button').click();

    cy.get('.psv-gallery').should('be.visible');
  });

  it('应高亮当前项目', () => {
    cy.get('[data-psv-gallery-item=sphere]').should('have.class', 'psv-gallery-item--active');

    setPanorama('sphere-test.jpg');

    cy.get('[data-psv-gallery-item=sphere]').should('not.have.class', 'psv-gallery-item--active');
    cy.get('[data-psv-gallery-item=test-sphere]').should('have.class', 'psv-gallery-item--active');

    setPanorama('sphere-cropped.jpg');

    cy.get('.psv-gallery-item--active').should('not.exist');
  });

  it('点击时应切换全景图', () => {
    cy.get('[data-psv-gallery-item=test-sphere]').click();
    waitViewerReady();

    checkPanorama('sphere-test.jpg');
    cy.get('.psv-caption-content').should('have.text', 'Test sphere'); // 使用名称作为标题

    cy.get('[data-psv-gallery-item=1]').click();
    waitViewerReady();

    cy.get('.psv-caption-content').should('have.text', '佛罗里达角灯塔，基比斯坎 © Pixexid');
  });

  it('点击后应隐藏', () => {
    callGallery('设置 hideOnClick').then((gallery) => gallery.setOption('hideOnClick', true));

    cy.get('[data-psv-gallery-item=test-sphere]').click();

    cy.get('.psv-gallery').should('not.be.visible');
  });

  it('应能修改缩略图尺寸', () => {
    callGallery('设置 thumbnailSize').then((gallery) =>
      gallery.setOption('thumbnailSize', { width: 100, height: 100 }),
    );

    waitForAllThumbnails();

    cy.get('.psv-gallery').compareScreenshots('set-thumbnailSize');
  });

  it('应能修改项目', () => {
    callGallery('设置项目').then((gallery) => {
      gallery.setItems([
        {
          id: 1,
          panorama: BASE_URL + 'tour/key-biscayne-1.jpg',
          thumbnail: BASE_URL + 'tour/key-biscayne-1-thumb.jpg',
        },
        {
          id: 2,
          panorama: BASE_URL + 'tour/key-biscayne-2.jpg',
          thumbnail: BASE_URL + 'tour/key-biscayne-2-thumb.jpg',
        },
      ]);
    });

    cy.get('.psv-gallery').compareScreenshots('set-items');
  });

  it('缺少 "id" 或 "panorama" 时应抛出异常', () => {
    callGallery('设置项目').then((gallery) => {
      expect(() => gallery.setItems([{ id: null, panorama: 'img.jpg' }])).to.throw('Item 0 has no "id".');

      expect(() => gallery.setItems([{ id: 'id', panorama: null }])).to.throw('Item "id" has no "panorama".');
    });
  });

  it('应能通过自定义回调修改项目', () => {
    const callback = cy.stub();

    callGallery('设置项目').then((gallery) => {
      gallery.setItems(
        [
          {
            id: 1,
            panorama: BASE_URL + 'tour/key-biscayne-1.jpg',
            thumbnail: BASE_URL + 'tour/key-biscayne-1-thumb.jpg',
          },
        ],
        callback,
      );
    });

    cy.get('[data-psv-gallery-item=1]')
      .click()
      .should('have.class', 'psv-gallery-item--active')
      .then(() => expect(callback).to.be.calledOnceWith('1'));

    // 未改变
    checkPanorama('sphere-small.jpg');

    cy.wrap(callback, NO_LOG).then(() => {
      cy.log('重置 stub');
      callback.reset();
    });

    cy.get('[data-psv-gallery-item=1]')
      .click()
      .then(() => expect(callback).to.not.have.been.called);
  });

  it('没有项目时应隐藏按钮', () => {
    callGallery('设置项目').then((gallery) => gallery.setItems(null));

    cy.get('.psv-gallery-button').should('not.be.visible');

    cy.get('.psv-gallery').should('not.be.visible');
  });

  it('加载时应保持不可见', () => {
    cy.visit('e2e/plugins/gallery.html?visibleOnLoad=false');
    waitViewerReady();

    cy.get('.psv-gallery').should('not.be.visible');
  });

  function callGallery(log: string) {
    return callPlugin<GalleryPlugin>('gallery', log);
  }

  function waitForAllThumbnails() {
    cy.waitForResources('key-biscayne-5-thumb.jpg', 'key-biscayne-6-thumb.jpg', 'key-biscayne-7-thumb.jpg');
  }
});

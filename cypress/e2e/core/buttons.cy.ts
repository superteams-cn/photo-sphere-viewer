import { callViewer, checkPosition, checkZoom, waitViewerReady } from '../../utils';
import { BASE_URL, NO_LOG } from '../../utils/constants';

describe('核心：按钮', () => {
  beforeEach(() => {
    localStorage.photoSphereViewer_touchSupport = 'false';
    cy.visit('e2e/core/navbar.html');
    waitViewerReady();
  });

  // 无头模式下无法工作
  it.skip('应能进入和退出全屏', () => {
    cy.get('.psv-fullscreen-button').click();
    cy.wait(500);

    cy.document().its('fullscreenElement').should('not.be.null');

    cy.get('.psv-fullscreen-button').click();

    cy.document().its('fullscreenElement').should('be.null');
  });

  it('应能通过按钮缩放', () => {
    checkZoom(50);

    cy.get('[title="放大"]').click();
    cy.wait(500);

    callViewer('检查缩放 >50').then((viewer) => expect(viewer.getZoomLevel()).gt(50));

    cy.get('[title="缩小"]').trigger('mousedown');
    cy.wait(1000);
    cy.get('[title="缩小"]').trigger('mouseup');

    callViewer('检查缩放 <50').then((viewer) => expect(viewer.getZoomLevel()).lt(50));
  });

  it('应能通过滑块缩放', () => {
    withZoomHandlePosition(({ element, x, y, width, height }) => {
      const clickPoint = { clientX: x + width * 0.5, clientY: y + height * 0.5 };
      const movePoint = { clientX: clickPoint.clientX + 20, clientY: clickPoint.clientY };

      element.trigger('mousedown', clickPoint).trigger('mousemove', movePoint).trigger('mouseup', movePoint);
    });

    checkZoom(75);

    withZoomHandlePosition(({ element, x, y, width, height }) => {
      const clickPoint = { clientX: x + width * 0.5, clientY: y + height * 0.5 };
      const movePoint = { clientX: 0, clientY: clickPoint.clientY };

      element.trigger('mousedown', clickPoint).trigger('mousemove', movePoint).trigger('mouseup', movePoint);
    });

    checkZoom(0);
  });

  it('应能通过按钮左右移动', () => {
    callViewer('设置 yaw = PI').then((viewer) => viewer.rotate({ yaw: Math.PI, pitch: 0 }));

    cy.get('[title="向右移动"]').click();
    cy.wait(500);

    callViewer('检查 yaw > PI').then((viewer) => expect(viewer.getPosition().yaw).gt(Math.PI));

    cy.get('[title="向左移动"]').trigger('mousedown');
    cy.wait(1000);
    cy.get('[title="向左移动"]').trigger('mouseup');

    callViewer('检查 yaw < PI').then((viewer) => expect(viewer.getPosition().yaw).lt(Math.PI));
  });

  it('应能通过按钮上下移动', () => {
    checkPosition({ yaw: 0, pitch: 0 });

    cy.get('[title="向上移动"]').click();
    cy.wait(500);

    callViewer('检查 pitch > 0').then((viewer) => expect(viewer.getPosition().pitch).gt(0));

    cy.get('[title="向下移动"]').trigger('mousedown');
    cy.wait(1000);
    cy.get('[title="向下移动"]').trigger('mouseup');

    callViewer('检查 pitch < 0').then((viewer) => expect(viewer.getPosition().pitch).lt(0));
  });

  it('应能下载全景图', () => {
    cy.get('.psv-download-button')
      .should('have.attr', 'href', BASE_URL + 'sphere-small.jpg')
      .should('have.attr', 'download', 'sphere-small.jpg');

    callViewer('设置 downloadName/downloadUrl').then((viewer) =>
      viewer.setOptions({
        downloadUrl: 'panorama-download.jpg',
        downloadName: 'my-panorama.jpg',
      }),
    );

    cy.get('.psv-download-button')
      .should('have.attr', 'href', 'panorama-download.jpg')
      .should('have.attr', 'download', 'my-panorama.jpg');

    const png64 =
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';
    callViewer('设置 base64 downloadUrl').then((viewer) =>
      viewer.setOptions({
        downloadUrl: png64,
        downloadName: null,
      }),
    );

    cy.get('.psv-download-button').should('have.attr', 'href', png64).should('have.attr', 'download', 'panorama.png');
  });

  function withZoomHandlePosition(
    cb: (res: {
      element: Cypress.Chainable<JQuery<HTMLElement>>;
      x: number;
      y: number;
      width: number;
      height: number;
    }) => void,
  ) {
    cy.get('.psv-zoom-range-handle').then((element) => {
      const { x, y, width, height } = element[0].getBoundingClientRect();

      cb({
        element: cy.wrap(element, NO_LOG),
        x,
        y,
        width,
        height,
      });
    });
  }
});

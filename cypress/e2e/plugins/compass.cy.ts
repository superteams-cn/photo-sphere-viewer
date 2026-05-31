import type { CompassPlugin } from '@photo-sphere-viewer/compass-plugin';
import type { Point } from '@photo-sphere-viewer/core';
import type { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { callPlugin, callViewer, checkPosition, waitViewerReady } from '../../utils';
import { BASE_URL, NO_LOG } from '../../utils/constants';

describe('插件：指南针', () => {
  beforeEach(() => {
    cy.visit('e2e/plugins/compass.html');
    waitViewerReady();
  });

  it('应能销毁查看器', () => {
    callViewer('销毁').then((viewer) => viewer.destroy());
  });

  it('应显示指南针', () => {
    cy.get('.psv-compass').should('be.visible').compareScreenshots('base');
  });

  it('应能隐藏指南针', () => {
    callCompass('隐藏指南针').then((compass) => compass.hide());

    cy.get('.psv-compass').should('not.be.visible');

    callCompass('显示指南针').then((compass) => compass.show());

    cy.get('.psv-compass').should('be.visible');
  });

  it('应支持平移与缩放', () => {
    callViewer('旋转 90 度')
      .then((viewer) => viewer.rotate({ pitch: 0, yaw: '90deg' }))
      .wait(200);

    cy.get('.psv-compass').compareScreenshots('rotate');

    callViewer('缩放到 100%')
      .then((viewer) => viewer.zoom(100))
      .wait(200);

    cy.get('.psv-compass').compareScreenshots('zoom');
  });

  it('应显示导航锥形视野', () => {
    withCompassPosition(({ element, x, y, width, height }) => {
      // 中右
      const enterPoint = { clientX: x + width, clientY: y + height * 0.5 };
      // 底部居中偏上
      const clickPoint = { clientX: x + width * 0.5, clientY: y + height * 0.75 };
      // 底部居中
      const leavePoint = { clientX: x + width * 0.5, clientY: y + height };

      element
        .trigger('mouseenter', enterPoint)
        .compareScreenshots('navigation-1')
        .trigger('mousemove', clickPoint)
        .compareScreenshots('navigation-2')
        .trigger('mousedown', clickPoint)
        .trigger('mouseup', clickPoint)
        .trigger('mouseleave', leavePoint)
        .compareScreenshots('navigation-3');
    });

    checkPosition({ yaw: Math.PI, pitch: 0 });
  });

  it('应能禁用导航', () => {
    callCompass('禁用导航').then((compass) => compass.setOption('navigation', false));

    withCompassPosition(({ element, x, y, width, height }) => {
      const point = { clientX: x + width * 0.5, clientY: y + height * 0.75 };

      element
        .trigger('mouseenter', point)
        .compareScreenshots('base')
        .trigger('mousedown', point)
        .trigger('mouseup', point)
        .trigger('mouseleave', point);
    });

    checkPosition({ yaw: 0, pitch: 0 });
  });

  it('点击时应能重置俯仰角', () => {
    callViewer('向下移动')
      .then((viewer) => viewer.rotate({ yaw: 0, pitch: -1 }))
      .wait(200);

    withCompassPosition(({ element, x, y, width, height }) => {
      const point = { clientX: x + width * 0.75, clientY: y + height * 0.5 };

      element.trigger('mousedown', point).trigger('mouseup', point);
    });

    checkPosition({ yaw: Math.PI / 2, pitch: -1 });

    callCompass('设置 resetPitch').then((compass) => compass.setOption('resetPitch', true));

    withCompassPosition(({ element, x, y, width, height }) => {
      const point = { clientX: x + width * 0.5, clientY: y + height * 0.75 };

      element.trigger('mousedown', point).trigger('mouseup', point);
    });

    checkPosition({ yaw: Math.PI, pitch: 0 });
  });

  it('应能修改 navigationColor', () => {
    callCompass('设置 navigationColor').then((compass) => compass.setOption('navigationColor', 'rgba(0, 255, 0, 0.5)'));

    withCompassPosition(({ element, x, y, width, height }) => {
      const point = { clientX: x + width * 0.5, clientY: y + height * 0.75 };

      element.trigger('mousemove', point).compareScreenshots('set-navigationColor').trigger('mouseleave');
    });
  });

  it('应能修改 coneColor', () => {
    callCompass('设置 coneColor').then((compass) => compass.setOption('coneColor', '#00000055'));

    cy.get('.psv-compass').compareScreenshots('set-coneColor');
  });

  it('应能修改尺寸', () => {
    callCompass('设置尺寸').then((compass) => compass.setOption('size', '300px'));

    cy.get('.psv-compass').compareScreenshots('set-size');
  });

  it('应能修改 backgroundSvg', () => {
    callCompass('设置 backgroundSvg').then((compass) =>
      compass.setOption(
        'backgroundSvg',
        '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="50" fill="rgba(0, 0, 0, .5)"/></svg>',
      ),
    );

    cy.get('.psv-compass').compareScreenshots('set-backgroundSvg');
  });

  it('应能修改位置', () => {
    const size = 120;
    const margin = 10;
    const nav = 40;
    const vw = Cypress.config('viewportWidth');
    const vh = Cypress.config('viewportHeight');

    [
      ['top left', { x: margin, y: margin }],
      ['top center', { x: vw / 2 - size / 2, y: margin }],
      ['top right', { x: vw - size - margin, y: margin }],
      ['left center', { x: margin, y: vh / 2 - size / 2 }],
      ['center center', { x: vw / 2 - size / 2, y: vh / 2 - size / 2 }],
      ['right center', { x: vw - size - margin, y: vh / 2 - size / 2 }],
      ['bottom left', { x: margin, y: vh - nav - margin - size }],
      ['bottom center', { x: vw / 2 - size / 2, y: vh - nav - margin - size }],
      ['bottom right', { x: vw - size - margin, y: vh - nav - margin - size }],
    ].forEach(([position, coords]: [string, Point]) => {
      callCompass(`设置位置 ${position}`).then((compass) => compass.setOption('position', position));

      cy.get('.psv-compass').should((compass) => {
        const { x, y } = compass[0].getBoundingClientRect();
        expect({ x, y }).to.deep.eq(coords);
      });
    });

    callViewer('隐藏导航栏')
      .then((viewer) => viewer.navbar.hide())
      .wait(200);

    [
      ['bottom left', { x: margin, y: vh - margin - size }],
      ['bottom center', { x: vw / 2 - size / 2, y: vh - margin - size }],
      ['bottom right', { x: vw - size - margin, y: vh - margin - size }],
    ].forEach(([position, coords]: [string, Point]) => {
      callCompass(`设置位置 ${position}`).then((compass) => compass.setOption('position', position));

      cy.get('.psv-compass')
        .then((element) => {
          const { x, y } = element[0].getBoundingClientRect();
          return { x, y } satisfies Point;
        })
        .should('deep.equal', coords);
    });
  });

  it('应显示热点', () => {
    callCompass('设置热点').then((compass) => {
      compass.setHotspots([
        // @ts-ignore 缺少 pitch
        { yaw: 0 },
        { yaw: Math.PI / 2, pitch: 0 },
        { yaw: Math.PI, pitch: -1 },
        { yaw: (Math.PI * 3) / 2, pitch: 1 },
      ]);
    });

    cy.get('.psv-compass').compareScreenshots('hotspots');
  });

  it('应能设置热点颜色', () => {
    callCompass('设置热点').then((compass) => {
      compass.setOption('hotspotColor', 'green');

      compass.setHotspots([
        { yaw: 0, pitch: 0 },
        { yaw: Math.PI / 2, pitch: 0, color: 'red' },
        { yaw: Math.PI, pitch: 0, color: 'rgba(255, 0, 0, 0.5)' },
        { yaw: (Math.PI * 3) / 2, pitch: 0, color: '#ff000050' },
      ]);
    });

    cy.get('.psv-compass').compareScreenshots('hotspots-color');
  });

  it('应显示标记', () => {
    callMarkers('设置标记').then((markers) => {
      markers.setMarkers([
        {
          id: 'image',
          position: { yaw: Math.PI / 2, pitch: 0 },
          image: BASE_URL + 'pictos/pin-red.png',
          size: { width: 32, height: 32 },
          data: { compass: '#cc3333' },
        },
        {
          id: 'image-hidden',
          position: { yaw: Math.PI / 2, pitch: 1 },
          image: BASE_URL + 'pictos/pin-red.png',
          size: { width: 32, height: 32 },
        },
        {
          id: 'polygon',
          polygonPixels: [
            [2941 / 3, 1413 / 3],
            [3042 / 3, 1402 / 3],
            [3222 / 3, 1419 / 3],
            [3433 / 3, 1463 / 3],
            [3480 / 3, 1505 / 3],
            [3438 / 3, 1538 / 3],
            [3241 / 3, 1543 / 3],
            [3041 / 3, 1555 / 3],
            [2854 / 3, 1559 / 3],
            [2739 / 3, 1516 / 3],
            [2775 / 3, 1469 / 3],
            [2941 / 3, 1413 / 3],
          ],
          data: { compass: 'rgba(255, 0, 50, 0.8)' },
        },
        {
          id: 'polyline',
          polylinePixels: [
            [2478 / 3, 1635 / 3],
            [2184 / 3, 1747 / 3],
            [1674 / 3, 1953 / 3],
            [1166 / 3, 1852 / 3],
            [709 / 3, 1669 / 3],
            [301 / 3, 1519 / 3],
            [94 / 3, 1399 / 3],
            [34 / 3, 1356 / 3],
          ],
          data: { compass: 'rgba(80, 150, 50, 0.8)' },
        },
      ]);
    });

    cy.get('.psv-compass').compareScreenshots('markers');
  });

  function withCompassPosition(
    cb: (res: {
      element: Cypress.Chainable<JQuery<HTMLElement>>;
      x: number;
      y: number;
      width: number;
      height: number;
    }) => void,
  ) {
    cy.get('.psv-compass').then((element) => {
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

  function callCompass(log: string) {
    return callPlugin<CompassPlugin>('compass', log);
  }

  function callMarkers(log: string) {
    return callPlugin<MarkersPlugin>('markers', log);
  }
});

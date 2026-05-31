import { callViewer } from '../../utils';

describe('核心：加载器', () => {
  beforeEach(() => {
    cy.visit('e2e/core/loader.html');
  });

  it('应显示加载器', () => {
    cy.get('.psv-loader')
      .should('be.visible')
      .should('include.text', '加载中...')
      .should((loader) => {
        const { x, y, width, height } = loader[0].getBoundingClientRect();
        expect({ x, y, width, height }).to.deep.eq({ x: 565, y: 375, width: 150, height: 150 });
      })
      .compareScreenshots('base');
  });

  it('应能隐藏和显示加载器', () => {
    callViewer('隐藏加载器').then((viewer) => viewer.loader.hide());

    cy.get('.psv-loader').should('not.be.visible');

    callViewer('显示加载器').then((viewer) => viewer.loader.show());

    cy.get('.psv-loader').should('be.visible');
  });

  it('应能修改加载文本和图片', () => {
    callViewer('set lang.loading').then((viewer) => viewer.setOption('lang', { loading: 'Chargement...' }));

    cy.get('.psv-loader').should('include.text', 'Chargement...');

    callViewer('set loadingTxt').then((viewer) => viewer.setOption('loadingTxt', 'Veuillez patienter'));

    cy.get('.psv-loader').should('include.text', 'Veuillez patienter');

    callViewer('set loadingImg').then((viewer) =>
      viewer.setOption('loadingImg', 'https://photo-sphere-viewer.js.org/favicon.png'),
    );

    cy.waitForResources('favicon.png');
    cy.get('.psv-loader').compareScreenshots('loading-img');
  });

  it('应能修改加载进度', () => {
    [
      [0, 0],
      [45, 45],
      [75, 75],
      [100, 100],
      [-20, 0],
      [150, 100],
    ].forEach(([progress, expected]) => {
      callViewer(`设置进度 ${progress}`).then((viewer) => viewer.loader.setProgress(progress));

      cy.get('.psv-loader').compareScreenshots(`progress_${expected}`);
    });
  });
});

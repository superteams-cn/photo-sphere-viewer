import type { ResolutionPlugin } from '@photo-sphere-viewer/resolution-plugin';
import { callPlugin, callViewer, checkEventHandler, checkPanorama, setPanorama, waitViewerReady } from '../../utils';
import { BASE_URL } from '../../utils/constants';

describe('插件：分辨率', () => {
  beforeEach(() => {
    localStorage.photoSphereViewer_touchSupport = 'false';
    cy.visit('e2e/plugins/resolution.html');
    waitViewerReady();
  });

  it('应能销毁', () => {
    callViewer('销毁').then((viewer) => viewer.destroy());
  });

  it('应显示设置面板', () => {
    cy.get('.psv-settings-button').compareScreenshots('button-sd').click();

    cy.get('.psv-settings').compareScreenshots('settings');

    cy.get('[data-setting-id="resolution"]').click();

    cy.get('.psv-settings').compareScreenshots('settings-options');
  });

  it('不应显示设置按钮徽标', () => {
    cy.visit('e2e/plugins/resolution.html?showBadge=false');

    cy.get('.psv-settings-button').should('not.include.text', 'SD');
  });

  it('应能翻译设置项', () => {
    callViewer('设置语言').then((viewer) => viewer.setOption('lang', { resolution: 'Qualité' }));

    cy.get('.psv-settings-button').click();

    cy.get('.psv-settings').should('include.text', 'Qualité');
  });

  it('应使用第一个画质档位', () => {
    checkPanorama('sphere-small.jpg');
  });

  it('应使用默认画质档位', () => {
    cy.visit('e2e/plugins/resolution.html?resolution=HD');

    checkPanorama('sphere-small.jpg?hd');
  });

  it('初始全景图存在时应忽略默认画质档位', () => {
    cy.visit('e2e/plugins/resolution.html?resolution=HD&withPanorama=true');

    checkPanorama('sphere-small.jpg');
  });

  it('应能切换画质档位', () => {
    const resolutionChangeHandler = listenResolutionEvent('resolution-changed');

    cy.get('.psv-settings-button').click();
    cy.get('[data-setting-id="resolution"]').click();
    cy.get('[data-option-id="HD"]').click();

    checkPanorama('sphere-small.jpg?hd');
    checkEventHandler(resolutionChangeHandler, { resolutionId: 'HD' });
    cy.get('.psv-settings-button').blur().compareScreenshots('button-hd');
  });

  it('应能通过 API 切换画质档位', () => {
    const resolutionChangeHandler = listenResolutionEvent('resolution-changed');

    callResolution('设置画质档位').then((resolution) => resolution.setResolution('HD'));

    checkPanorama('sphere-small.jpg?hd');
    checkEventHandler(resolutionChangeHandler, { resolutionId: 'HD' });

    callResolution('设置无效画质档位').then((resolution) => {
      expect(() => resolution.setResolution('MD')).to.throw('未知画质档位 "MD"。');
    });
  });

  it('全景图变化时应更新画质档位', () => {
    const resolutionChangeHandler = listenResolutionEvent('resolution-changed');

    setPanorama('sphere-small.jpg?hd');

    checkEventHandler(resolutionChangeHandler, { resolutionId: 'HD' });
  });

  it('应能修改可用画质档位', () => {
    const resolutionChangeHandler = listenResolutionEvent('resolution-changed');

    // 当前全景图存在于新列表中
    callResolution('设置画质档位列表（无默认值）').then((resolution) =>
      resolution.setResolutions([
        { id: 'large', label: 'large', panorama: BASE_URL + 'sphere-small.jpg?hd' },
        { id: 'small', label: 'small', panorama: BASE_URL + 'sphere-small.jpg' },
      ]),
    );

    checkEventHandler(resolutionChangeHandler, { resolutionId: 'small' });

    resolutionChangeHandler.reset();

    // 提供默认值
    callResolution('设置画质档位列表（有默认值）').then((resolution) =>
      resolution.setResolutions(
        [
          { id: 'large', label: 'large', panorama: BASE_URL + 'sphere-small.jpg?hd' },
          { id: 'small', label: 'small', panorama: BASE_URL + 'sphere-small.jpg' },
        ],
        'large',
      ),
    );
    cy.wait(200);

    checkPanorama('sphere-small.jpg?hd');
    checkEventHandler(resolutionChangeHandler, { resolutionId: 'large' });

    resolutionChangeHandler.reset();

    // 当前全景图不存在于新列表中
    setPanorama('sphere-test.jpg');
    callResolution('设置画质档位列表（无默认值且无匹配项）').then((resolution) =>
      resolution.setResolutions([
        { id: 'small', label: 'small', panorama: BASE_URL + 'sphere-small.jpg' },
        { id: 'large', label: 'large', panorama: BASE_URL + 'sphere-small.jpg?hd' },
      ]),
    );
    cy.wait(200);

    checkPanorama('sphere-small.jpg');
    checkEventHandler(resolutionChangeHandler, { resolutionId: 'small' });
  });

  it('缺少属性时应抛出异常', () => {
    callResolution('设置画质档位列表').then((resolution) => {
      expect(() => resolution.setResolutions([{ id: null, label: 'label', panorama: 'sphere.jpg' }])).to.throw(
        '缺少画质档位 id。',
      );

      expect(() => resolution.setResolutions([{ id: 'sd', label: null, panorama: 'sphere.jpg' }])).to.throw(
        '缺少画质档位标签。',
      );

      expect(() => resolution.setResolutions([{ id: 'sd', label: 'label', panorama: null }])).to.throw(
        '缺少画质档位全景图。',
      );
    });
  });

  function callResolution(log: string) {
    return callPlugin<ResolutionPlugin>('resolution', log);
  }

  function listenResolutionEvent(
    name: Parameters<ResolutionPlugin['addEventListener']>[0],
  ): Cypress.Agent<sinon.SinonStub> {
    const handler = cy.stub();
    callResolution(`监听 "${name}"`).then((resolution) => resolution.addEventListener(name, handler));
    return handler;
  }
});

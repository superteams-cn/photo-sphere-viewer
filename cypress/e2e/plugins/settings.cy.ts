import type { OptionsSetting, SettingsPlugin, ToggleSetting } from '@photo-sphere-viewer/settings-plugin';
import { callPlugin, callViewer, checkEventHandler, waitViewerReady } from '../../utils';
import { NO_LOG } from '../../utils/constants';

type ToggleSettingWithValue = ToggleSetting & { v: boolean };
type OptionsSettingWithValue = OptionsSetting & { v: string };

describe('plugin: settings', () => {
  let toggleSetting: ToggleSettingWithValue;
  let optionSetting: OptionsSettingWithValue;

  beforeEach(() => {
    localStorage.photoSphereViewer_touchSupport = 'false';
    cy.visit('e2e/plugins/settings.html');
    waitViewerReady();

    toggleSetting = withToggleSetting();
    optionSetting = withOptionsSetting();

    callSettings('add settings').then((settings) => {
      settings.addSetting(toggleSetting);
      settings.addSetting(optionSetting);
    });
  });

  it('应能销毁', () => {
    callViewer('destroy').then((viewer) => viewer.destroy());
  });

  it('应添加导航栏按钮', () => {
    cy.get('.psv-settings-button').should('be.visible').click().should('have.class', 'psv-button--active');

    cy.get('.psv-settings').should('be.visible').compareScreenshots('base');
  });

  it('打开面板时应隐藏设置', () => {
    cy.get('.psv-settings-button').click();

    callViewer('打开面板').then((viewer) => viewer.panel.show('中文内容'));

    cy.get('.psv-settings').should('not.be.visible');
  });

  it('应能移除设置', () => {
    callSettings('remove settings').then((settings) => {
      settings.removeSetting(toggleSetting.id);
      settings.removeSetting(optionSetting.id);
    });

    cy.get('.psv-settings-button').should('not.be.visible');
  });

  it('菜单应靠近按钮', () => {
    [
      ['caption settings', 'right', '0px'],
      ['settings caption', 'left', '0px'],
      ['zoom move settings caption', 'left', '290px'],
      ['download settings caption', 'left', '0px'],
      ['caption settings fullscreen', 'right', '0px'],
    ].forEach(([navbar, prop, value]) => {
      callViewer(`navbar "${navbar}"`).then((viewer) => viewer.setOption('navbar', navbar));

      cy.get('.psv-settings-button').click();

      cy.get('.psv-settings').should('have.css', prop, value);

      cy.get('.psv-settings-button').click();
    });
  });

  it('应能切换开关项', () => {
    const settingChangedHandler = listenSettingsEvent('setting-changed');

    cy.get('.psv-settings-button').click();
    cy.get('[data-setting-id=toggle-setting]').click();

    checkToggleValue(toggleSetting, true);
    checkEventHandler(settingChangedHandler, { settingId: 'toggle-setting', settingValue: true });
    cy.get('.psv-settings').compareScreenshots('toggle-true');

    cy.get('[data-setting-id=toggle-setting]').click();

    checkToggleValue(toggleSetting, false);
    checkEventHandler(settingChangedHandler, { settingId: 'toggle-setting', settingValue: false });
    cy.get('.psv-settings').compareScreenshots('base');
  });

  it('应能选择选项', () => {
    const settingChangedHandler = listenSettingsEvent('setting-changed');

    cy.get('.psv-settings-button').click();
    cy.get('[data-setting-id=options-setting]').click();

    cy.get('.psv-settings').compareScreenshots('option-list');

    cy.get('[data-option-id=__back]').click();

    checkOptionValue(optionSetting, 'A');
    cy.wrap(settingChangedHandler, NO_LOG).should('not.have.been.called');
    cy.get('.psv-settings').compareScreenshots('base');

    cy.get('[data-setting-id=options-setting]').click();
    cy.get('[data-option-id=B]').click();

    checkOptionValue(optionSetting, 'B');
    checkEventHandler(settingChangedHandler, { settingId: 'options-setting', settingValue: 'B' });
    cy.get('.psv-settings').should('not.be.visible');

    cy.get('.psv-settings-button').click();

    cy.get('.psv-settings').compareScreenshots('option-b');
  });

  it('应支持键盘导航', () => {
    cy.get('.psv-settings-button').trigger('keydown', { key: 'Enter' });
    cy.get('[data-setting-id=toggle-setting]').trigger('keydown', { key: 'Enter' });

    checkToggleValue(toggleSetting, true);

    cy.get('.psv-settings').trigger('keydown', { key: 'Escape' });

    cy.get('.psv-settings').should('not.be.visible');
  });

  it('应显示徽标', () => {
    cy.get('.psv-settings-button').should('include.text', 'A').compareScreenshots('badge-a');

    cy.get('.psv-settings-button').click();
    cy.get('[data-setting-id=options-setting]').click();
    cy.get('[data-option-id=B]').click();

    cy.get('.psv-settings-button').should('include.text', 'B').blur().compareScreenshots('badge-b');
  });

  it('缺少属性时应抛出异常', () => {
    callSettings('set settings').then((settings) => {
      expect(() => settings.addSetting({ ...withToggleSetting(), id: null })).to.throw('缺少设置 id。');

      expect(() => settings.addSetting({ ...withToggleSetting(), type: null })).to.throw('缺少设置类型。');

      expect(() => settings.addSetting(withToggleSetting())).to.throw('设置 "toggle-setting" 已存在。');
    });
  });

  it('应持久化到 localStorage', () => {
    cy.visit('e2e/plugins/settings.html?persist=true');
    waitViewerReady();

    callSettings('set settings').then((settings) => {
      settings.addSetting(toggleSetting);
      settings.addSetting(optionSetting);
    });

    cy.get('.psv-settings-button').click();
    cy.get('[data-setting-id=toggle-setting]').click();
    cy.get('[data-setting-id=options-setting]').click();
    cy.get('[data-option-id=B]').click();

    checkLocalStorage('psvSettings', 'toggle-setting', true);
    checkLocalStorage('psvSettings', 'options-setting', 'B');

    cy.reload();
    waitViewerReady();

    const settingChangedHandler = listenSettingsEvent('setting-changed');

    callSettings('set settings').then((settings) => {
      settings.addSetting(withToggleSetting());
      settings.addSetting(withOptionsSetting());
    });

    checkEventHandler(settingChangedHandler, { settingId: 'toggle-setting', settingValue: true });
    checkEventHandler(settingChangedHandler, { settingId: 'options-setting', settingValue: 'B' });

    cy.get('.psv-settings-button').click();
    cy.get('.psv-settings').compareScreenshots('option-b-toggle-true');
  });

  function callSettings(log: string) {
    return callPlugin<SettingsPlugin>('settings', log);
  }

  function listenSettingsEvent(
    name: Parameters<SettingsPlugin['addEventListener']>[0],
  ): Cypress.Agent<sinon.SinonStub> {
    const handler = cy.stub();
    callSettings(`listen "${name}"`).then((settings) => settings.addEventListener(name, handler));
    return handler;
  }

  function withToggleSetting() {
    return {
      id: 'toggle-setting',
      label: '开关设置',
      type: 'toggle',
      v: false,
      active() {
        return this.v;
      },
      toggle() {
        this.v = !this.v;
      },
    } satisfies ToggleSettingWithValue;
  }

  function checkToggleValue(setting: ToggleSettingWithValue, expected: boolean) {
    cy.wrap(setting, NO_LOG).should(() => expect(setting.v).to.eq(expected));
  }

  function withOptionsSetting() {
    return {
      id: 'options-setting',
      label: '选项设置',
      type: 'options',
      v: 'A',
      options: () => [
        { id: 'A', label: '选项 A' },
        { id: 'B', label: '选项 B' },
      ],
      current() {
        return this.v;
      },
      apply(option) {
        this.v = option;
      },
      badge() {
        return this.v;
      },
    } satisfies OptionsSettingWithValue;
  }

  function checkOptionValue(setting: OptionsSettingWithValue, expected: string) {
    cy.wrap(setting, NO_LOG).should(() => expect(setting.v).to.eq(expected));
  }

  function checkLocalStorage(key: string, name: string, value: any) {
    cy.window()
      .its('localStorage')
      .its(key)
      .should((psvSettings) => {
        expect(JSON.parse(psvSettings)).to.have.property(name, value);
      });
  }
});

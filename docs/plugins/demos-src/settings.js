import { Viewer } from '@photo-sphere-viewer/core';
import { SettingsPlugin } from '@photo-sphere-viewer/settings-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
  container: 'viewer',
  panorama: baseUrl + 'sphere.jpg',
  caption: 'Parc national du Mercantour <b>&copy; Damien Sorel</b>',
  loadingImg: baseUrl + 'loader.gif',
  touchmoveTwoFingers: true,
  mousewheelCtrlKey: true,

  plugins: [SettingsPlugin],
});

const settings = viewer.getPlugin(SettingsPlugin);

let currentToggle = true;
let currentOption = 'A';

settings.addSetting({
  id: 'custom-toggle-setting',
  label: '开关设置',
  type: 'toggle',
  active: () => currentToggle,
  toggle: () => (currentToggle = !currentToggle),
});

settings.addSetting({
  id: 'custom-options-setting',
  label: '选项设置',
  type: 'options',
  current: () => currentOption,
  options: () => [
    { id: 'A', label: '选项 A' },
    { id: 'B', label: '选项 B' },
  ],
  apply: (option) => (currentOption = option),
  badge: () => currentOption,
});

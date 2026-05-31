import { DEFAULTS, registerButton } from '@photo-sphere-viewer/core';
import * as events from './events';
import { SettingsButton } from './SettingsButton';

DEFAULTS.lang[SettingsButton.id] = '设置';
registerButton(SettingsButton, 'fullscreen:left');

export { SettingsPlugin } from './SettingsPlugin';
export * from './model';
export { events };

/** @internal  */
import './styles/index.scss';

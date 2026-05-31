import { DEFAULTS, registerButton } from '@photo-sphere-viewer/core';
import { GyroscopeButton } from './GyroscopeButton';
import * as events from './events';

DEFAULTS.lang[GyroscopeButton.id] = '陀螺仪';
registerButton(GyroscopeButton, 'caption:right');

export { GyroscopePlugin } from './GyroscopePlugin';
export * from './model';
export { events };

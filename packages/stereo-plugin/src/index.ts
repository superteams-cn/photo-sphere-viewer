import { DEFAULTS, registerButton } from '@photo-sphere-viewer/core';
import * as events from './events';
import { StereoButton } from './StereoButton';

DEFAULTS.lang[StereoButton.id] = '立体视图';
registerButton(StereoButton, 'caption:right');

DEFAULTS.lang.stereoNotification = '点击任意位置退出立体视图。';
DEFAULTS.lang.pleaseRotate = '请旋转设备';
DEFAULTS.lang.tapToContinue = '（或点击继续）';

export { StereoPlugin } from './StereoPlugin';
export { events };

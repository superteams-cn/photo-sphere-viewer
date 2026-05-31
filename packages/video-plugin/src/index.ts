import { DEFAULTS, registerButton } from '@photo-sphere-viewer/core';
import { PlayPauseButton } from './components/PlayPauseButton';
import { TimeCaption } from './components/TimeCaption';
import { VolumeButton } from './components/VolumeButton';
import * as events from './events';

DEFAULTS.lang[PlayPauseButton.id] = '播放/暂停';
DEFAULTS.lang[VolumeButton.id] = '音量';
registerButton(PlayPauseButton);
registerButton(VolumeButton);
registerButton(TimeCaption);
DEFAULTS.navbar.unshift(PlayPauseButton.groupId);

export { VideoPlugin } from './VideoPlugin';
export * from './model';
export { events };

/** @internal  */
import './styles/index.scss';

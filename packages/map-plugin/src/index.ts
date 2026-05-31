import { DEFAULTS } from '@photo-sphere-viewer/core';
import * as events from './events';

DEFAULTS.lang['map'] = '地图';
DEFAULTS.lang['mapMaximize'] = '最大化';
DEFAULTS.lang['mapMinimize'] = '最小化';
DEFAULTS.lang['mapNorth'] = '转向北方';
DEFAULTS.lang['mapReset'] = '重置';

export { MapPlugin } from './MapPlugin';
export * from './model';
export { events };

/** @internal  */
import './styles/index.scss';

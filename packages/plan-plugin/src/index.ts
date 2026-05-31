import { DEFAULTS } from '@photo-sphere-viewer/core';
import * as events from './events';

DEFAULTS.lang['map'] = '地图';
DEFAULTS.lang['mapMaximize'] = '最大化';
DEFAULTS.lang['mapMinimize'] = '最小化';
DEFAULTS.lang['mapReset'] = '重置';
DEFAULTS.lang['mapLayers'] = '底图图层';

export { PlanPlugin } from './PlanPlugin';
export * from './model';
export { events };

/** @internal  */
import './styles/index.scss';

import { utils } from '@photo-sphere-viewer/core';
import type { Marker } from './markers/Marker';
import icon from './icons/pin-list.svg';

/**
 * 用于创建 SVG 的命名空间
 * @internal
 */
export const SVG_NS = 'http://www.w3.org/2000/svg';

/**
 * 添加到标记元素上的属性名
 * @internal
 */
export const MARKER_DATA = 'psvMarker';

/**
 * 添加到标记元素上的属性名（短横线格式）
 * @internal
 */
export const MARKER_DATA_KEY = utils.dasherize(MARKER_DATA);

/**
 * 标记内容面板的标识符
 * @internal
 */
export const ID_PANEL_MARKER = 'marker';

/**
 * 标记列表面板标识符
 * @internal
 */
export const ID_PANEL_MARKERS_LIST = 'markersList';

/**
 * "hoverScale" 参数的默认配置
 * @internal
 */
export const DEFAULT_HOVER_SCALE = {
  amount: 2,
  duration: 100,
  easing: 'linear',
};

/**
 * 标记列表模板
 * @internal
 */
export const MARKERS_LIST_TEMPLATE = (markers: Marker[], title: string) => `
<div class="psv-panel-menu psv-panel-menu--stripped">
    <h1 class="psv-panel-menu-title">${icon} ${title}</h1>
    <ul class="psv-panel-menu-list">
    ${markers
      .map(
        (marker) => `
        <li data-${MARKER_DATA_KEY}="${marker.id}" class="psv-panel-menu-item" tabindex="0">
          ${marker.type === 'image' ? `<span class="psv-panel-menu-item-icon"><img src="${marker.definition}"/></span>` : ''}
          <span class="psv-panel-menu-item-label">${marker.getListContent()}</span>
        </li>
    `,
      )
      .join('')}
    </ul>
</div>
`;

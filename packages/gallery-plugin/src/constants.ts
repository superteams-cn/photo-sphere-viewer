import type { Size } from '@photo-sphere-viewer/core';
import { utils } from '@photo-sphere-viewer/core';
import { GalleryItem } from './model';

/**
 * 添加到图库项目上的属性名
 * @internal
 */
export const GALLERY_ITEM_DATA = 'psvGalleryItem';

/**
 * 添加到图库项目上的属性名（短横线格式）
 * @internal
 */
export const GALLERY_ITEM_DATA_KEY = utils.dasherize(GALLERY_ITEM_DATA);

/**
 * 添加到当前图库项目上的类名
 * @internal
 */
export const ACTIVE_CLASS = 'psv-gallery-item--active';

/**
 * 图库模板
 * @internal
 */
export const ITEMS_TEMPLATE = (items: GalleryItem[], size: Size) => `
${items
  .map(
    (item) => `
<div class="psv-gallery-item" 
     data-${GALLERY_ITEM_DATA_KEY}="${item.id}"
     style="width:${size.width}px; aspect-ratio:${size.width / size.height};"
     tabindex="0">
    ${item.name ? `<div class="psv-gallery-item-title"><span>${item.name}</span></div>` : ''}
    <svg class="psv-gallery-item-thumb" viewBox="0 0 200 200" preserveAspectRatio="xMidYMid slice"><use href="#psvGalleryBlankIcon"></use></svg>
    ${item.thumbnail ? `<div class="psv-gallery-item-thumb" data-src="${item.thumbnail}"></div>` : ''}
</div>
`,
  )
  .join('')}
`;

import { Viewer } from '@photo-sphere-viewer/core';
import { VisibleRangePlugin } from '@photo-sphere-viewer/visible-range-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
  container: 'viewer',
  panorama: baseUrl + 'sphere-cropped.jpg',
  caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
  loadingImg: baseUrl + 'loader.gif',
  touchmoveTwoFingers: true,
  mousewheelCtrlKey: true,
  defaultZoomLvl: 30,

  plugins: [
    VisibleRangePlugin.withConfig({
      usePanoData: true,
    }),
  ],
});

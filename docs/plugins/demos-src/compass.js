import { Viewer } from '@photo-sphere-viewer/core';
import { CompassPlugin } from '@photo-sphere-viewer/compass-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
  container: 'viewer',
  panorama: baseUrl + 'sphere.jpg',
  caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
  loadingImg: baseUrl + 'loader.gif',
  touchmoveTwoFingers: true,
  mousewheelCtrlKey: true,

  plugins: [
    CompassPlugin.withConfig({
      hotspots: [{ yaw: '0deg' }, { yaw: '90deg' }, { yaw: '180deg' }, { yaw: '270deg' }],
    }),
  ],
});

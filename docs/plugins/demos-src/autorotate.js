import { Viewer } from '@photo-sphere-viewer/core';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
  container: 'viewer',
  panorama: baseUrl + 'sphere.jpg',
  caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
  loadingImg: baseUrl + 'loader.gif',
  touchmoveTwoFingers: true,
  mousewheelCtrlKey: true,

  plugins: [
    AutorotatePlugin.withConfig({
      autostartDelay: 1000,
      autorotatePitch: '5deg',
    }),
  ],
});

import { Viewer } from '@photo-sphere-viewer/core';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
  container: 'viewer',
  panorama: baseUrl + 'sphere.jpg',
  caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
  loadingImg: baseUrl + 'loader.gif',
  touchmoveTwoFingers: true,
  mousewheelCtrlKey: true,
  navbar: ['zoom', 'caption', 'fullscreen'],
});

let i = 1;
setInterval(() => {
  viewer.notification.show({
    content: `Annoying notification #${i++}`,
    timeout: 1000,
  });
}, 2000);

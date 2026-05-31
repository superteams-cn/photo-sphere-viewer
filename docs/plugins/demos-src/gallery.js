import { Viewer } from '@photo-sphere-viewer/core';
import { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
  container: 'viewer',
  panorama: baseUrl + 'sphere.jpg',
  caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
  loadingImg: baseUrl + 'loader.gif',
  touchmoveTwoFingers: true,
  mousewheelCtrlKey: true,

  plugins: [
    GalleryPlugin.withConfig({
      visibleOnLoad: true,
    }),
  ],
});

const gallery = viewer.getPlugin(GalleryPlugin);

gallery.setItems([
  {
    id: 'sphere',
    panorama: baseUrl + 'sphere.jpg',
    thumbnail: baseUrl + 'sphere-small.jpg',
    options: {
      caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
    },
  },
  {
    id: 'sphere-test',
    panorama: baseUrl + 'sphere-test.jpg',
    name: '测试全景图',
  },
  {
    id: 'key-biscayne',
    panorama: baseUrl + 'tour/key-biscayne-1.jpg',
    thumbnail: baseUrl + 'tour/key-biscayne-1-thumb.jpg',
    name: 'Key Biscayne',
    options: {
      caption: '佛罗里达角灯塔，基比斯坎 <b>&copy; Pixexid</b>',
    },
  },
]);

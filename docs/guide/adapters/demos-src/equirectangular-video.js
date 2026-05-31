import { Viewer } from '@photo-sphere-viewer/core';
import { EquirectangularVideoAdapter } from '@photo-sphere-viewer/equirectangular-video-adapter';
import { VideoPlugin } from '@photo-sphere-viewer/video-plugin';
import { SettingsPlugin } from '@photo-sphere-viewer/settings-plugin';
import { ResolutionPlugin } from '@photo-sphere-viewer/resolution-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

new Viewer({
  container: 'viewer',
  adapter: EquirectangularVideoAdapter.withConfig({
    muted: true,
  }),
  caption: '大城府 <b>&copy; meetle</b>',
  loadingImg: baseUrl + 'loader.gif',
  touchmoveTwoFingers: true,
  mousewheelCtrlKey: true,
  navbar: 'video caption settings fullscreen',

  plugins: [
    VideoPlugin,
    SettingsPlugin,
    ResolutionPlugin.withConfig({
      defaultResolution: 'HD',
      resolutions: [
        {
          id: 'UHD',
          label: '超高清',
          panorama: { source: baseUrl + 'equirectangular-video/Ayutthaya_UHD.mp4' },
        },
        {
          id: 'FHD',
          label: '高清',
          panorama: { source: baseUrl + 'equirectangular-video/Ayutthaya_FHD.mp4' },
        },
        {
          id: 'HD',
          label: '标准',
          panorama: { source: baseUrl + 'equirectangular-video/Ayutthaya_HD.mp4' },
        },
        {
          id: 'SD',
          label: '低清',
          panorama: { source: baseUrl + 'equirectangular-video/Ayutthaya_SD.mp4' },
        },
      ],
    }),
  ],
});

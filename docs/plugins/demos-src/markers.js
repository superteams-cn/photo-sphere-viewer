import { Viewer } from '@photo-sphere-viewer/core';
import { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';

const baseUrl = 'https://photo-sphere-viewer-data.netlify.app/assets/';

const viewer = new Viewer({
  container: 'viewer',
  panorama: baseUrl + 'sphere.jpg',
  caption: '梅康图尔国家公园 <b>&copy; Damien Sorel</b>',
  loadingImg: baseUrl + 'loader.gif',
  touchmoveTwoFingers: true,
  mousewheelCtrlKey: true,

  plugins: [
    MarkersPlugin.withConfig({
      // 标记列表
      markers: [
        {
          // 点击后打开面板的图片标记
          id: 'image',
          position: { yaw: 0.32, pitch: 0.11 },
          image: baseUrl + 'pictos/pin-blue.png',
          size: { width: 32, height: 32 },
          anchor: 'bottom center',
          zoomLvl: 100,
          tooltip: '图片标记。<b>点我！</b>',
          content: document.getElementById('lorem-content').innerHTML,
        },
        {
          // 渲染在 3D 场景中的图片标记
          id: 'imageLayer',
          imageLayer: baseUrl + 'pictos/tent.png',
          size: { width: 120, height: 94 },
          position: { yaw: -0.45, pitch: -0.1 },
          tooltip: '嵌入场景的图片',
        },
        {
          // 带自定义样式的 HTML 标记
          id: 'text',
          position: { yaw: 0, pitch: 0 },
          html: 'HTML <b>marker</b> &hearts;',
          anchor: 'bottom right',
          scale: [0.5, 1.5],
          style: {
            maxWidth: '100px',
            color: 'white',
            fontSize: '20px',
            fontFamily: 'Helvetica, sans-serif',
            textAlign: 'center',
          },
          tooltip: {
            content: 'HTML 标记',
            position: 'right',
          },
        },
        {
          // 多边形标记
          id: 'polygon',
          polygon: [
            [6.2208, 0.0906],
            [0.0443, 0.1028],
            [0.2322, 0.0849],
            [0.4531, 0.0387],
            [0.5022, -0.0056],
            [0.4587, -0.0396],
            [0.252, -0.0453],
            [0.0434, -0.0575],
            [6.1302, -0.0623],
            [6.0094, -0.0169],
            [6.0471, 0.032],
            [6.2208, 0.0906],
          ],
          svgStyle: {
            fill: 'rgba(200, 0, 0, 0.2)',
            stroke: 'rgba(200, 0, 50, 0.8)',
            strokeWidth: '2px',
          },
          tooltip: {
            content: '动态多边形标记',
            position: 'bottom right',
          },
        },
        {
          // 折线标记
          id: 'polyline',
          polylinePixels: [
            [2478, 1635],
            [2184, 1747],
            [1674, 1953],
            [1166, 1852],
            [709, 1669],
            [301, 1519],
            [94, 1399],
            [34, 1356],
          ],
          svgStyle: {
            stroke: 'rgba(140, 190, 10, 0.8)',
            strokeLinecap: 'round',
            strokeLinejoin: 'round',
            strokeWidth: '10px',
          },
          tooltip: '动态折线标记',
        },
        {
          // 圆形标记
          id: 'circle',
          circle: 20,
          position: { textureX: 2500, textureY: 1200 },
          tooltip: '圆形标记',
        },
      ],
    }),
  ],
});

const markersPlugin = viewer.getPlugin(MarkersPlugin);

/**
 * 用户点击任意位置时创建新标记
 */
viewer.addEventListener('click', ({ data }) => {
  if (!data.rightclick) {
    markersPlugin.addMarker({
      id: '#' + Math.random(),
      position: { yaw: data.yaw, pitch: data.pitch },
      image: baseUrl + 'pictos/pin-red.png',
      size: { width: 32, height: 32 },
      anchor: 'bottom center',
      tooltip: '生成的图钉',
      data: {
        generated: true,
      },
    });
  }
});

/**
 * 用户双击生成的标记时删除它；
 * 如果用户右键点击，则切换它的图片。
 */
markersPlugin.addEventListener('select-marker', ({ marker, doubleClick, rightClick }) => {
  if (marker.data?.generated) {
    if (doubleClick) {
      markersPlugin.removeMarker(marker);
    } else if (rightClick) {
      markersPlugin.updateMarker({
        id: marker.id,
        image: baseUrl + 'pictos/pin-blue.png',
      });
    }
  }
});

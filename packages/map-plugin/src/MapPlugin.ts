import { AbstractConfigurablePlugin, events, PluginConstructor, Point, utils, Viewer } from '@photo-sphere-viewer/core';
import type { Marker, events as markersEvents, MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import { Color } from 'three';
import { MapComponent } from './components/MapComponent';
import { HOTSPOT_GENERATED_ID, HOTSPOT_MARKER_ID, MARKER_DATA_KEY } from './constants';
import { MapPluginEvents } from './events';
import pin from './icons/pin.svg';
import { MapHotspot, MapPluginConfig, ParsedMapPluginConfig, UpdatableMapPluginConfig } from './model';

const getConfig = utils.getConfigParser<MapPluginConfig, ParsedMapPluginConfig>(
  {
    imageUrl: null,
    center: null,
    rotation: 0,
    shape: 'round',
    size: '200px',
    position: ['bottom', 'left'],
    visibleOnLoad: true,
    overlayImage: undefined,
    pinImage: pin,
    pinSize: 35,
    coneColor: '#1E78E6',
    coneSize: 40,
    spotStyle: {
      size: 15,
      image: null,
      color: 'white',
      borderSize: 0,
      borderColor: null,
      hoverSize: null,
      hoverImage: null,
      hoverColor: null,
      hoverBorderSize: 4,
      hoverBorderColor: 'rgba(255, 255, 255, 0.6)',
    },
    static: false,
    defaultZoom: 100,
    minZoom: 20,
    maxZoom: 200,
    hotspots: [],
    minimizeOnHotspotClick: true,
    buttons: {
      maximize: true,
      close: true,
      reset: true,
      north: true,
    },
  },
  {
    spotStyle: (spotStyle, { defValue }) => ({ ...defValue, ...spotStyle }),
    position: (position, { defValue }) => {
      return utils.cleanCssPosition(position, { allowCenter: false, cssOrder: true }) || defValue;
    },
    rotation: (rotation) => utils.parseAngle(rotation),
    coneColor: (coneColor) => (coneColor ? new Color(coneColor).getStyle() : null), // must be in rgb format
    defaultZoom: (defaultZoom) => Math.log(defaultZoom / 100),
    maxZoom: (maxZoom) => Math.log(maxZoom / 100),
    minZoom: (minZoom) => Math.log(minZoom / 100),
    buttons: (buttons, { defValue }) => ({ ...defValue, ...buttons }),
  },
);

/**
 * 为查看器添加小地图
 */
export class MapPlugin extends AbstractConfigurablePlugin<
  MapPluginConfig,
  ParsedMapPluginConfig,
  UpdatableMapPluginConfig,
  MapPluginEvents
> {
  static override readonly id = 'map';
  static override readonly VERSION = PKG_VERSION;
  static override readonly configParser = getConfig;
  static override readonly readonlyOptions: Array<keyof MapPluginConfig> = [
    'imageUrl',
    'visibleOnLoad',
    'defaultZoom',
    'buttons',
  ];

  private markers?: MarkersPlugin;
  readonly component: MapComponent;

  static withConfig(config: MapPluginConfig): [PluginConstructor, any] {
    return [MapPlugin, config];
  }

  constructor(viewer: Viewer, config: MapPluginConfig) {
    super(viewer, config);

    this.component = new MapComponent(this.viewer, this);
  }

  /**
   * @internal
   */
  override init() {
    super.init();

    utils.checkStylesheet(this.viewer.container, 'map-plugin');

    this.component.init();

    this.markers = this.viewer.getPlugin('markers');

    this.viewer.addEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.addEventListener(events.ZoomUpdatedEvent.type, this);
    this.viewer.addEventListener(events.SizeUpdatedEvent.type, this);
    this.viewer.addEventListener(events.ReadyEvent.type, this, { once: true });
    this.markers?.addEventListener('set-markers', this);

    this.setHotspots(this.config.hotspots, false);
  }

  /**
   * @internal
   */
  override destroy() {
    this.viewer.removeEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.removeEventListener(events.ZoomUpdatedEvent.type, this);
    this.viewer.removeEventListener(events.SizeUpdatedEvent.type, this);
    this.viewer.removeEventListener(events.ReadyEvent.type, this);
    this.markers?.removeEventListener('set-markers', this);

    this.component.destroy();

    delete this.markers;

    super.destroy();
  }

  /**
   * @internal
   */
  handleEvent(e: Event) {
    switch (e.type) {
      case events.ReadyEvent.type:
        this.component.reload(this.config.imageUrl);
        break;
      case events.PositionUpdatedEvent.type:
      case events.ZoomUpdatedEvent.type:
        this.component.update();
        break;
      case events.SizeUpdatedEvent.type:
        if (this.component.maximized) {
          this.component.update();
        }
        break;
      case 'set-markers':
        this.component.setMarkers(this.__markersToHotspots((e as markersEvents.SetMarkersEvent).markers));
        break;
      default:
        break;
    }
  }

  override setOptions(options: Partial<UpdatableMapPluginConfig>) {
    super.setOptions(options);

    if (options.center) {
      this.component.recenter();
    }
    if (options.hotspots !== undefined) {
      this.setHotspots(options.hotspots);
    }

    this.component.applyConfig();
  }

  /**
   * 隐藏地图
   */
  hide() {
    this.component.hide();
  }

  /**
   * 显示地图
   */
  show() {
    this.component.show();
  }

  /**
   * 修改当前缩放级别
   */
  setZoom(level: number) {
    this.component.setZoom(Math.log(level / 100));
  }

  /**
   * 关闭地图
   */
  close() {
    if (!this.component.collapsed) {
      this.component.toggleCollapse();
    }
  }

  /**
   * 打开地图
   */
  open() {
    if (this.component.collapsed) {
      this.component.toggleCollapse();
    }
  }

  /**
   * 最小化地图
   */
  minimize() {
    if (this.component.maximized) {
      this.component.toggleMaximized();
    }
  }

  /**
   * 最大化地图
   */
  maximize() {
    if (!this.component.maximized) {
      this.component.toggleMaximized();
    }
  }

  /**
   * 更换地图图片
   * @param rotation 同时更新图片旋转角度
   * @param center 同时更新地图上的位置
   */
  setImage(url: string, center?: Point, rotation?: string | number) {
    if (!utils.isNil(rotation)) {
      this.config.rotation = utils.parseAngle(rotation);
    }
    if (!utils.isNil(center)) {
      this.config.center = center;
    }
    this.component.reload(url);
  }

  /**
   * 修改地图上的位置
   */
  setCenter(center: Point, resetView = true) {
    const previousCenter = this.config.center;
    this.config.center = center;
    if (resetView || !previousCenter) {
      this.component.recenter();
    } else {
      this.component.addOffset({
        x: previousCenter.x - center.x,
        y: previousCenter.y - center.y,
      });
    }
  }

  /**
   * 修改地图热点
   */
  setHotspots(hotspots: MapHotspot[] | null, render = true) {
    const ids: string[] = [];
    let i = 1;

    hotspots?.forEach((hotspot) => {
      if (!hotspot.id) {
        hotspot.id = HOTSPOT_GENERATED_ID + i++;
      } else if (ids.includes(hotspot.id)) {
        utils.logWarn(`热点 id "${hotspot.id}" 重复。`);
      } else {
        ids.push(hotspot.id);
      }
    });

    this.config.hotspots = hotspots || [];

    if (render) {
      this.component.update();
    }
  }

  /**
   * Removes all hotspots
   */
  clearHotspots() {
    this.setHotspots(null);
  }

  /**
   * 修改高亮热点
   */
  setActiveHotspot(hotspotId: string | null) {
    this.component.setActiveHotspot(hotspotId);
  }

  private __markersToHotspots(markers: Marker[]): MapHotspot[] {
    return markers
      .filter((marker) => marker.data?.[MARKER_DATA_KEY])
      .map((marker) => {
        const hotspot: MapHotspot = {
          ...marker.data[MARKER_DATA_KEY],
          id: HOTSPOT_MARKER_ID + marker.id,
          tooltip: marker.config.tooltip,
        };

        if ('distance' in hotspot) {
          hotspot.yaw = marker.state.position.yaw;
        } else if (!('x' in hotspot) || !('y' in hotspot)) {
          utils.logWarn(`标记 #${marker.id} 的 "map" 数据缺少位置（distance 或 x+y）。`);
          return null;
        }

        return hotspot;
      })
      .filter((h) => h);
  }
}

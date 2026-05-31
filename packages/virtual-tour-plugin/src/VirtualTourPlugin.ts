import type { CompassPlugin } from '@photo-sphere-viewer/compass-plugin';
import type { PluginConstructor, Point, Position, Tooltip, Viewer } from '@photo-sphere-viewer/core';
import { AbstractConfigurablePlugin, PSVError, events, utils } from '@photo-sphere-viewer/core';
import type { GalleryPlugin } from '@photo-sphere-viewer/gallery-plugin';
import type { MapPlugin, events as mapEvents } from '@photo-sphere-viewer/map-plugin';
import type { MarkersPlugin } from '@photo-sphere-viewer/markers-plugin';
import type { PlanPlugin, events as planEvents } from '@photo-sphere-viewer/plan-plugin';
import { MathUtils } from 'three';
import { ArrowsRenderer } from './ArrowsRenderer';
import { DEFAULT_ARROW, LINK_DATA, LINK_ID, LOADING_TOOLTIP } from './constants';
import { AbstractDatasource } from './datasources/AbstractDataSource';
import { ClientSideDatasource } from './datasources/ClientSideDatasource';
import { ServerSideDatasource } from './datasources/ServerSideDatasource';
import { EnterArrowEvent, LeaveArrowEvent, NodeChangedEvent, VirtualTourEvents } from './events';
import {
  GpsPosition,
  VirtualTourLink,
  VirtualTourNode,
  VirtualTourPluginConfig,
  VirtualTourTransitionOptions,
} from './model';
import { gpsToSpherical } from './utils';

const getConfig = utils.getConfigParser<VirtualTourPluginConfig>(
  {
    dataMode: 'client',
    positionMode: 'manual',
    renderMode: '3d',
    nodes: null,
    getNode: null,
    startNodeId: null,
    preload: false,
    transitionOptions: {
      showLoader: true,
      speed: '20rpm',
      effect: 'fade',
      rotation: true,
    },
    linksOnCompass: true,
    showLinkTooltip: true,
    getLinkTooltip: null,
    arrowStyle: DEFAULT_ARROW,
    arrowsPosition: {
      minPitch: 0.3,
      maxPitch: Math.PI / 2,
      linkOverlapAngle: Math.PI / 4,
      linkPitchOffset: -0.1,
    },
    map: null,
  },
  {
    dataMode(dataMode) {
      if (dataMode !== 'client' && dataMode !== 'server') {
        throw new PSVError('虚拟导览插件：dataMode 无效。');
      }
      return dataMode;
    },
    positionMode(positionMode) {
      if (positionMode !== 'gps' && positionMode !== 'manual') {
        throw new PSVError('虚拟导览插件：positionMode 无效。');
      }
      return positionMode;
    },
    renderMode(renderMode) {
      if (renderMode !== '3d' && renderMode !== '2d') {
        throw new PSVError('虚拟导览插件：renderMode 无效。');
      }
      return renderMode;
    },
    arrowsPosition(arrowsPosition, { defValue }) {
      return { ...defValue, ...arrowsPosition };
    },
    arrowStyle(arrowStyle, { defValue }) {
      return { ...defValue, ...arrowStyle };
    },
    map(map, { rawConfig }) {
      if (map) {
        if (rawConfig.dataMode === 'server') {
          utils.logWarn('虚拟导览插件：服务端模式不能使用地图。');
          return null;
        }
        if (!map.imageUrl) {
          utils.logWarn('虚拟导览插件：配置地图至少需要 "imageUrl"。');
          return null;
        }
        if (!('recenter' in map)) {
          map.recenter = true;
        }
      }
      return map;
    },
  },
);

/**
 * 通过连接多个全景图创建虚拟导览
 */
export class VirtualTourPlugin extends AbstractConfigurablePlugin<
  VirtualTourPluginConfig,
  VirtualTourPluginConfig,
  never,
  VirtualTourEvents
> {
  static override readonly id = 'virtual-tour';
  static override readonly VERSION = PKG_VERSION;
  static override readonly configParser = getConfig;
  static override readonly readonlyOptions = Object.keys(getConfig.defaults);

  private readonly state = {
    currentNode: null as VirtualTourNode,
    currentTooltip: null as Tooltip,
    loadingNode: null as string,
    preload: {} as Record<string, boolean | Promise<any>>,
  };

  private datasource: AbstractDatasource;
  private arrowsRenderer: ArrowsRenderer;

  private map?: MapPlugin;
  private plan?: PlanPlugin;
  private markers?: MarkersPlugin;
  private compass?: CompassPlugin;
  private gallery?: GalleryPlugin;

  get is3D(): boolean {
    return this.config.renderMode === '3d';
  }

  get isServerSide(): boolean {
    return this.config.dataMode === 'server';
  }

  get isGps(): boolean {
    return this.config.positionMode === 'gps';
  }

  static withConfig(config: VirtualTourPluginConfig): [PluginConstructor, any] {
    return [VirtualTourPlugin, config];
  }

  constructor(viewer: Viewer, config: VirtualTourPluginConfig) {
    super(viewer, config);

    this.arrowsRenderer = new ArrowsRenderer(this.viewer, this);
  }

  /**
   * @internal
   */
  override init() {
    super.init();

    this.arrowsRenderer.init();

    utils.checkStylesheet(this.viewer.container, 'virtual-tour-plugin');

    this.markers = this.viewer.getPlugin('markers');
    this.compass = this.viewer.getPlugin('compass');

    if (this.markers?.config.markers) {
      utils.logWarn('使用虚拟导览插件时，不能在标记插件上配置默认标记。' + '请在每个导览节点上定义 `markers`。');
      delete this.markers.config.markers;
    }

    if (this.isGps) {
      this.plan = this.viewer.getPlugin('plan');
    }

    if (!this.isServerSide) {
      this.gallery = this.viewer.getPlugin('gallery');
      this.map = this.viewer.getPlugin('map');

      if (this.config.map && !this.map) {
        utils.logWarn('虚拟导览插件已配置地图，但尚未加载地图插件。');
      }
    }

    this.datasource = this.isServerSide
      ? new ServerSideDatasource(this, this.viewer)
      : new ClientSideDatasource(this, this.viewer);

    if (this.map) {
      this.map.addEventListener('select-hotspot', this);
      this.map.setImage(this.config.map.imageUrl);
    }

    this.plan?.addEventListener('select-hotspot', this);

    if (this.isServerSide) {
      if (this.config.startNodeId) {
        this.setCurrentNode(this.config.startNodeId);
      }
    } else if (this.config.nodes) {
      this.setNodes(this.config.nodes, this.config.startNodeId);
      delete this.config.nodes;
    }
  }

  /**
   * @internal
   */
  override destroy() {
    this.map?.removeEventListener('select-hotspot', this);
    this.plan?.removeEventListener('select-hotspot', this);

    this.datasource.destroy();
    this.arrowsRenderer.destroy();

    delete this.datasource;
    delete this.markers;
    delete this.compass;
    delete this.gallery;
    delete this.arrowsRenderer;

    super.destroy();
  }

  /**
   * @internal
   */
  handleEvent(e: Event) {
    if (e instanceof events.ClickEvent) {
      const link = e.data.objects.find((o) => o.userData[LINK_DATA])?.userData[LINK_DATA];
      if (link) {
        this.setCurrentNode(link.nodeId, null, link);
      }
    } else if (e.type === 'select-hotspot') {
      const id = (e as mapEvents.SelectHotspot | planEvents.SelectHotspot).hotspotId;
      if (id.startsWith(LINK_ID)) {
        this.setCurrentNode(id.substring(LINK_ID.length));
      }
    }
  }

  /**
   * 返回当前节点
   */
  getCurrentNode(): VirtualTourNode {
    return this.state.currentNode;
  }

  /**
   * 设置节点（仅客户端模式）
   * @throws {@link Core.PSVError | PSVError} 非客户端模式时抛出
   */
  setNodes(nodes: VirtualTourNode[], startNodeId?: string) {
    if (this.isServerSide) {
      throw new PSVError('服务端模式不能设置节点。');
    }

    this.__hideTooltip();
    this.state.currentNode = null;

    (this.datasource as ClientSideDatasource).setNodes(nodes);

    if (!startNodeId) {
      startNodeId = nodes[0].id;
    } else if (!this.datasource.nodes[startNodeId]) {
      startNodeId = nodes[0].id;
      utils.logWarn(`提供的节点中未找到 startNodeId，已重置为 ${startNodeId}。`);
    }
    this.setCurrentNode(startNodeId);

    this.__setGalleryItems();
    this.__setMapHotspots();
    this.__setPlanHotspots();
  }

  /**
   * 切换当前节点
   * @returns {Promise<boolean>} 如果加载被另一次调用中止，则解析为 false
   */
  setCurrentNode(
    nodeId: string,
    options?: VirtualTourTransitionOptions & {
      /**
       * 即使节点已经加载，也重新加载
       */
      forceUpdate?: boolean;
    },
    fromLink?: VirtualTourLink,
  ): Promise<boolean> {
    if (nodeId === this.state.currentNode?.id && !options?.forceUpdate) {
      return Promise.resolve(true);
    }

    if (options?.forceUpdate && this.isServerSide) {
      (this.datasource as ServerSideDatasource).clearCache();
    }

    this.viewer.hideError();

    this.state.loadingNode = nodeId;

    const fromNode = this.state.currentNode;
    const fromLinkPosition = fromNode && fromLink ? this.__getLinkPosition(fromNode, fromLink) : null;

    // 如果该节点正在预加载，等待其完成
    return Promise.resolve(this.state.preload[nodeId])
      .then(() => {
        if (this.state.loadingNode !== nodeId) {
          throw utils.getAbortError();
        }

        return this.datasource.loadNode(nodeId);
      })
      .then((node) => {
        if (this.state.loadingNode !== nodeId) {
          throw utils.getAbortError();
        }

        const transitionOptions: VirtualTourTransitionOptions = {
          ...getConfig.defaults.transitionOptions,
          rotateTo: fromLinkPosition,
          zoomTo: fromLinkPosition ? this.viewer.getZoomLevel() : null, // prevents the adapter to apply InitialHorizontalFOVDegrees
          ...(typeof this.config.transitionOptions === 'function'
            ? this.config.transitionOptions(node, fromNode, fromLink)
            : this.config.transitionOptions),
          ...options,
        };

        if (!transitionOptions.effect) {
          transitionOptions.effect = 'none';
        }

        this.viewer.panel.hide('description');

        this.__hideTooltip();

        this.arrowsRenderer.clear();

        if (this.gallery?.config.hideOnClick) {
          this.gallery.hide();
        }
        if (this.map?.config.minimizeOnHotspotClick) {
          this.map.minimize();
        }
        if (this.plan?.config.minimizeOnHotspotClick) {
          this.plan.minimize();
        }

        if (transitionOptions.rotation && transitionOptions.effect === 'none') {
          return this.viewer
            .animate({
              ...transitionOptions.rotateTo,
              zoom: transitionOptions.zoomTo,
              speed: transitionOptions.speed,
            })
            .then(() => [node, transitionOptions] as [VirtualTourNode, VirtualTourTransitionOptions]);
        } else {
          return Promise.resolve([node, transitionOptions] as [VirtualTourNode, VirtualTourTransitionOptions]);
        }
      })
      .then(([node, transitionOptions]) => {
        if (this.state.loadingNode !== nodeId) {
          throw utils.getAbortError();
        }

        this.markers?.clearMarkers();

        if (this.config.linksOnCompass) {
          this.compass?.clearHotspots();
        }

        return this.viewer
          .setPanorama(node.panorama, {
            caption: node.caption,
            description: node.description,
            panoData: node.panoData,
            sphereCorrection: node.sphereCorrection,
            showLoader: transitionOptions.showLoader,
            position: transitionOptions.rotateTo,
            zoom: transitionOptions.zoomTo,
            transition:
              transitionOptions.effect === 'none'
                ? false
                : {
                    effect: transitionOptions.effect,
                    rotation: transitionOptions.rotation,
                    speed: transitionOptions.speed,
                  },
          })
          .then((completed) => {
            if (!completed) {
              throw utils.getAbortError();
            }

            return node;
          });
      })
      .then((node) => {
        if (this.state.loadingNode !== nodeId) {
          throw utils.getAbortError();
        }

        this.state.currentNode = node;

        if (this.map) {
          // 如果节点在地图上不可见，就无法确定地图应居中到哪里，
          // 因此保留当前中心点
          this.map.setCenter(this.__getNodeMapPosition(node) ?? this.map.config.center, this.config.map.recenter);
        }
        this.plan?.setCoordinates(node.gps);

        this.__addNodeMarkers(node);
        this.__renderLinks(node);
        this.__preload(node);

        this.state.loadingNode = null;

        this.dispatchEvent(
          new NodeChangedEvent(node, {
            fromNode,
            fromLink,
            fromLinkPosition,
          }),
        );

        this.viewer.resetIdleTimer();

        return true;
      })
      .catch((err) => {
        if (utils.isAbortError(err)) {
          return false;
        }

        this.viewer.showError(this.viewer.config.lang.loadError);

        this.viewer.loader.hide();
        this.viewer.navbar.setCaption('');

        this.state.loadingNode = null;

        throw err;
      });
  }

  /**
   * 旋转视图，使其朝向链接
   */
  async gotoLink(nodeId: string, speed: string | number = '8rpm'): Promise<void> {
    const position = this.getLinkPosition(nodeId);

    if (!speed) {
      this.viewer.rotate(position);
    } else {
      await this.viewer.animate({
        ...position,
        speed,
      });
    }
  }

  /**
   * 返回链接在查看器中的位置
   */
  getLinkPosition(nodeId: string): Position {
    const link = this.state.currentNode?.links.find((link) => link.nodeId === nodeId);

    if (!link) {
      throw new PSVError(`找不到链接 "${nodeId}"。`);
    }

    return this.__getLinkPosition(this.state.currentNode, link);
  }

  /**
   * 更新节点（仅客户端模式）
   * 除 "id" 以外所有属性均可选，新配置会与旧配置合并
   * @throws {@link Core.PSVError | PSVError} 非客户端模式时抛出
   */
  updateNode(newNode: Partial<VirtualTourNode> & { id: VirtualTourNode['id'] }) {
    if (this.isServerSide) {
      throw new PSVError('服务端模式不能更新节点。');
    }

    const node = (this.datasource as ClientSideDatasource).updateNode(newNode);

    if (newNode.name || newNode.thumbnail || newNode.panorama) {
      this.__setGalleryItems();
    }
    if (newNode.name || newNode.gps || newNode.map) {
      this.__setMapHotspots();
    }
    if (newNode.name || newNode.gps || newNode.plan) {
      this.__setPlanHotspots();
    }

    if (this.state.currentNode?.id === node.id) {
      this.__hideTooltip();

      if (newNode.panorama || newNode.panoData || newNode.sphereCorrection) {
        this.setCurrentNode(node.id, { forceUpdate: true });
        return;
      }

      if (newNode.caption) {
        this.viewer.setOption('caption', node.caption);
      }
      if (newNode.description) {
        this.viewer.setOption('description', node.description);
      }

      if (newNode.links || newNode.gps) {
        this.__renderLinks(node);
      }

      if (newNode.gps) {
        this.plan?.setCoordinates(node.gps);
      }

      if (newNode.map || newNode.gps) {
        this.map?.setCenter(this.__getNodeMapPosition(node));
      }

      if (newNode.markers || newNode.gps) {
        this.__addNodeMarkers(node);
      }
    }
  }

  /**
   * 更新图库插件
   */
  private __setGalleryItems() {
    if (this.gallery) {
      this.gallery.setItems(
        Object.values(this.datasource.nodes)
          .filter((node) => node.showInGallery !== false)
          .map((node) => ({
            id: node.id,
            panorama: node.panorama,
            name: node.name,
            thumbnail: node.thumbnail,
          })),
        (id) => {
          this.setCurrentNode(id as string);
        },
      );
    }
  }

  /**
   * 更新地图插件
   */
  private __setMapHotspots() {
    if (this.map) {
      this.map.setHotspots(
        Object.values(this.datasource.nodes)
          .filter((node) => node.map !== false)
          .map((node) => ({
            tooltip: node.name,
            ...(node.map || {}),
            ...this.__getNodeMapPosition(node),
            id: LINK_ID + node.id,
          })),
      );
    }
  }

  /**
   * 更新平面图插件
   */
  private __setPlanHotspots() {
    if (this.plan) {
      this.plan.setHotspots(
        Object.values(this.datasource.nodes)
          .filter((node) => node.plan !== false)
          .map((node) => ({
            tooltip: node.name,
            ...(node.plan || {}),
            coordinates: node.gps,
            id: LINK_ID + node.id,
          })),
      );
    }
  }

  /**
   * 为节点添加链接
   */
  private __renderLinks(node: VirtualTourNode) {
    this.arrowsRenderer.clear();

    const positions: Position[] = [];

    node.links.forEach((link) => {
      const position = this.__getLinkPosition(node, link);
      position.yaw += link.linkOffset?.yaw ?? 0;
      position.pitch += link.linkOffset?.pitch ?? 0;

      if (this.isGps && !this.is3D) {
        position.pitch += this.config.arrowsPosition.linkPitchOffset;
      }

      positions.push(position);

      this.arrowsRenderer.addLinkArrow(link, position, link.linkOffset?.depth);
    });

    this.arrowsRenderer.render();

    if (this.config.linksOnCompass) {
      this.compass?.setHotspots(positions);
    }
  }

  /**
   * 计算链接标记的位置
   */
  private __getLinkPosition(node: VirtualTourNode, link: VirtualTourLink): Position {
    if (this.isGps) {
      return gpsToSpherical(node.gps, link.gps);
    } else {
      return this.viewer.dataHelper.cleanPosition(link.position);
    }
  }

  /**
   * 返回节点的完整提示框内容
   */
  private async __getTooltipContent(link: VirtualTourLink): Promise<string> {
    const node = await this.datasource.loadNode(link.nodeId);
    const elements: string[] = [];

    if (node.name || node.thumbnail || node.caption) {
      if (node.name) {
        elements.push(`<h3>${node.name}</h3>`);
      }
      if (node.thumbnail) {
        elements.push(`<img src="${node.thumbnail}">`);
      }
      if (node.caption) {
        elements.push(`<p>${node.caption}</p>`);
      }
    }

    let content = elements.join('');
    if (this.config.getLinkTooltip) {
      content = this.config.getLinkTooltip(content, link, node);
    }
    return content;
  }

  /** @internal */
  __onEnterArrow(link: VirtualTourLink, evt: MouseEvent) {
    const viewerPos = utils.getPosition(this.viewer.container);

    const viewerPoint: Point = {
      x: evt.clientX - viewerPos.x,
      y: evt.clientY - viewerPos.y,
    };

    if (this.config.showLinkTooltip) {
      this.state.currentTooltip = this.viewer.createTooltip({
        ...LOADING_TOOLTIP,
        left: viewerPoint.x,
        top: viewerPoint.y,
        box: {
          // 让提示框与指针保持距离
          width: 20,
          height: 20,
        },
      });

      this.__getTooltipContent(link).then((content) => {
        if (content) {
          this.state.currentTooltip.update(content);
        } else {
          this.__hideTooltip();
        }
      });
    }

    this.map?.setActiveHotspot(LINK_ID + link.nodeId);
    this.plan?.setActiveHotspot(LINK_ID + link.nodeId);

    this.dispatchEvent(new EnterArrowEvent(link, this.state.currentNode));
  }

  /** @internal */
  __onHoverArrow(evt: MouseEvent) {
    const viewerPos = utils.getPosition(this.viewer.container);

    const viewerPoint: Point = {
      x: evt.clientX - viewerPos.x,
      y: evt.clientY - viewerPos.y,
    };

    this.state.currentTooltip?.move({
      left: viewerPoint.x,
      top: viewerPoint.y,
    });
  }

  /** @internal */
  __onLeaveArrow(link: VirtualTourLink) {
    this.__hideTooltip();

    this.map?.setActiveHotspot(null);
    this.plan?.setActiveHotspot(null);

    this.dispatchEvent(new LeaveArrowEvent(link, this.state.currentNode));
  }

  /**
   * 隐藏提示框
   */
  private __hideTooltip() {
    this.state.currentTooltip?.hide();
    this.state.currentTooltip = null;
  }

  /**
   * 管理相邻全景图的预加载
   */
  private __preload(node: VirtualTourNode) {
    if (!this.config.preload) {
      return;
    }

    this.state.preload[node.id] = true;

    this.state.currentNode.links
      .filter((link) => !this.state.preload[link.nodeId])
      .filter((link) => {
        if (typeof this.config.preload === 'function') {
          return this.config.preload(this.state.currentNode, link);
        } else {
          return true;
        }
      })
      .forEach((link) => {
        this.state.preload[link.nodeId] = this.datasource
          .loadNode(link.nodeId)
          .then((linkNode) => {
            return this.viewer.textureLoader.preloadPanorama(linkNode.panorama);
          })
          .then(() => {
            this.state.preload[link.nodeId] = true;
          })
          .catch(() => {
            delete this.state.preload[link.nodeId];
          });
      });
  }

  /**
   * 将标记切换为节点中定义的标记
   */
  private __addNodeMarkers(node: VirtualTourNode) {
    if (node.markers) {
      if (this.markers) {
        this.markers.setMarkers(
          node.markers.map((marker) => {
            if (marker.gps && this.isGps) {
              marker.position = gpsToSpherical(node.gps, marker.gps);
              if (marker.data?.['map']) {
                Object.assign(marker.data['map'], this.__getGpsMapPosition(marker.gps));
              }
              if (marker.data?.['plan']) {
                marker.data['plan'].coordinates = marker.gps;
              }
            }
            return marker;
          }),
        );
      } else {
        utils.logWarn(`由于插件未加载，节点 ${node.id} 的标记已被忽略。`);
      }
    }
  }

  /**
   * 获取节点在地图上的位置（如果适用）
   */
  private __getNodeMapPosition(node: VirtualTourNode): Point {
    const fromGps = this.__getGpsMapPosition(node.gps);
    if (fromGps) {
      return fromGps;
    } else if (node.map) {
      return { x: node.map.x, y: node.map.y };
    } else {
      return null;
    }
  }

  /**
   * 获取 GPS 位置在地图上的坐标
   */
  private __getGpsMapPosition(gps: GpsPosition): Point {
    const map = this.config.map;
    if (this.isGps && map && map.extent && map.size) {
      return {
        x: MathUtils.mapLinear(gps[0], map.extent[0], map.extent[2], 0, map.size.width),
        y: MathUtils.mapLinear(gps[1], map.extent[1], map.extent[3], 0, map.size.height),
      };
    } else {
      return null;
    }
  }
}

import type { Viewer } from '@photo-sphere-viewer/core';
import { PSVError, utils } from '@photo-sphere-viewer/core';
import { VirtualTourLink, VirtualTourNode } from '../model';
import type { VirtualTourPlugin } from '../VirtualTourPlugin';

export abstract class AbstractDatasource {
  nodes: Record<string, VirtualTourNode> = {};

  constructor(
    protected readonly plugin: VirtualTourPlugin,
    protected readonly viewer: Viewer,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy() {}

  /**
   * 加载节点
   */
  abstract loadNode(nodeId: string): Promise<VirtualTourNode>;

  /**
   * 检查节点配置
   */
  protected checkNode(node: VirtualTourNode) {
    if (!node.id) {
      throw new PSVError('节点缺少 id。');
    }
    if (!node.panorama) {
      throw new PSVError(`节点 ${node.id} 缺少 panorama。`);
    }
    if (this.plugin.isGps && !(node.gps?.length >= 2)) {
      throw new PSVError(`节点 ${node.id} 缺少 GPS 位置。`);
    }
    if (!this.plugin.isGps && node.markers?.some((marker) => marker.gps && !marker.position)) {
      throw new PSVError(`手动模式下不能对标记使用 GPS 定位。`);
    }
    if (!node.links) {
      utils.logWarn(`节点 ${node.id} 没有链接。`);
      node.links = [];
    }
  }

  /**
   * 检查链接配置
   */
  protected checkLink(node: VirtualTourNode, link: VirtualTourLink) {
    if (!link.nodeId) {
      throw new PSVError(`节点 ${node.id} 的链接缺少目标 id。`);
    }
    if (link.nodeId === node.id) {
      throw new PSVError(`节点 ${node.id} 链接到了自身。`);
    }
    if (!this.plugin.isGps && !utils.isExtendedPosition(link.position)) {
      throw new PSVError(`节点 ${node.id} 的链接 ${link.nodeId} 缺少位置。`);
    }
    if (this.plugin.isGps && !link.gps) {
      throw new PSVError(`节点 ${node.id} 的链接 ${link.nodeId} 缺少 GPS 位置。`);
    }
  }
}

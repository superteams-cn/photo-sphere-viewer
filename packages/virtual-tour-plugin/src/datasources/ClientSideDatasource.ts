import { PSVError, utils } from '@photo-sphere-viewer/core';
import { VirtualTourNode } from '../model';
import { AbstractDatasource } from './AbstractDataSource';

export class ClientSideDatasource extends AbstractDatasource {
  async loadNode(nodeId: string) {
    if (this.nodes[nodeId]) {
      return this.nodes[nodeId];
    } else {
      throw new PSVError(`未找到节点 ${nodeId}。`);
    }
  }

  setNodes(rawNodes: VirtualTourNode[]) {
    if (!rawNodes?.length) {
      throw new PSVError('未提供节点。');
    }

    const nodes: Record<string, VirtualTourNode> = {};
    const linkedNodes: Record<string, boolean> = {};

    rawNodes.forEach((node) => {
      this.checkNode(node);

      if (nodes[node.id]) {
        throw new PSVError(`节点 ${node.id} 重复。`);
      }

      nodes[node.id] = node;
    });

    rawNodes.forEach((node) => {
      this.__checkLinks(node, nodes);

      node.links.forEach((link) => {
        linkedNodes[link.nodeId] = true;
      });
    });

    rawNodes.forEach((node) => {
      if (!linkedNodes[node.id]) {
        utils.logWarn(`节点 ${node.id} 没有被任何链接指向。`);
      }
    });

    this.nodes = nodes;
  }

  updateNode(rawNode: Partial<VirtualTourNode> & { id: VirtualTourNode['id'] }) {
    if (!rawNode.id) {
      throw new PSVError('节点缺少 id。');
    }

    const node = this.nodes[rawNode.id];
    if (!node) {
      throw new PSVError(`节点 ${rawNode.id} 不存在。`);
    }

    Object.assign(node, rawNode);

    this.checkNode(node);

    this.__checkLinks(node, this.nodes);

    return node;
  }

  private __checkLinks(node: VirtualTourNode, nodes: Record<string, VirtualTourNode>) {
    node.links.forEach((link) => {
      if (!nodes[link.nodeId]) {
        throw new PSVError(`节点 ${node.id} 的目标节点 ${link.nodeId} 不存在。`);
      }

      link.gps = link.gps || nodes[link.nodeId].gps;

      this.checkLink(node, link);
    });
  }
}

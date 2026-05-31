import type {
  AdapterConstructor,
  PanoData,
  PanoramaPosition,
  Position,
  TextureData,
  Viewer,
} from '@photo-sphere-viewer/core';
import { AbstractAdapter, CONSTANTS, EquirectangularAdapter, events, utils } from '@photo-sphere-viewer/core';
import { BufferAttribute, Group, Mesh, MeshBasicMaterial, SphereGeometry, Texture, Vector3 } from 'three';
import { Queue, Task } from '../../shared/Queue';
import { buildDebugTexture, buildErrorMaterial, createWireFrame } from '../../shared/tiles-utils';
import {
  EquirectangularMultiTilesPanorama,
  EquirectangularTilesAdapterConfig,
  EquirectangularTilesPanoData,
  EquirectangularTilesPanorama,
} from './model';
import {
  EquirectangularTileConfig,
  checkPanoramaConfig,
  getCacheKey,
  getTileConfig,
  getTileConfigByIndex,
} from './utils';

/* the faces of the top and bottom rows are made of a single triangle (3 vertices)
 * 其他面均由两个三角形组成（6 个顶点）
 * 以下是每个面的顶点索引
 *
 * 第一行面：
 *     ⋀
 *    /0\
 *   /   \
 *  /     \
 * /1     2\
 * ¯¯¯¯¯¯¯¯¯
 *
 * 其他行面：
 * _________
 * |\1    0|
 * |3\     |
 * |  \    |
 * |   \   |
 * |    \  |
 * |     \2|
 * |4    5\|
 * ¯¯¯¯¯¯¯¯¯
 *
 * 最后一行面：
 * _________
 * \1     0/
 *  \     /
 *   \   /
 *    \2/
 *     ⋁
 */

type EquirectangularMesh = Mesh<SphereGeometry, MeshBasicMaterial>;
type EquirectangularTilesMesh = Mesh<SphereGeometry, MeshBasicMaterial[]>;
type EquirectangularTilesTextureData = TextureData<
  Texture,
  EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama,
  EquirectangularTilesPanoData
>;
type EquirectangularTile = {
  row: number;
  col: number;
  angle: number;
  config: EquirectangularTileConfig;
  url: string;
};

const NB_VERTICES_BY_FACE = 6;
const NB_VERTICES_BY_SMALL_FACE = 3;

const ATTR_UV = 'uv';
const ATTR_POSITION = 'position';

const ERROR_LEVEL = -1;

function tileId(tile: EquirectangularTile): string {
  return `${tile.col}x${tile.row}/${tile.config.level}`;
}

function meshes(group: Group) {
  return group.children as [EquirectangularMesh, EquirectangularTilesMesh];
}

const getConfig = utils.getConfigParser<EquirectangularTilesAdapterConfig>({
  resolution: 64,
  showErrorTile: true,
  baseBlur: true,
  antialias: true,
  debug: false,
  useXmpData: false,
});

const vertexPosition = new Vector3();

/**
 * 等距柱状瓦片适配器
 */
export class EquirectangularTilesAdapter extends AbstractAdapter<
  EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama,
  EquirectangularTilesPanoData,
  Texture,
  Group
> {
  static override readonly id = 'equirectangular-tiles';
  static override readonly VERSION = PKG_VERSION;
  static override readonly supportsDownload = false;

  // @internal
  public readonly SPHERE_SEGMENTS: number;
  // @internal
  public readonly SPHERE_HORIZONTAL_SEGMENTS: number;
  private readonly NB_VERTICES: number;
  private readonly NB_GROUPS: number;

  private readonly config: EquirectangularTilesAdapterConfig;

  private readonly state = {
    tileConfig: null as EquirectangularTileConfig,
    tiles: {} as Record<string, boolean>,
    faces: {} as Record<number, number>,
    geom: null as SphereGeometry,
    materials: [] as MeshBasicMaterial[],
    errorMaterial: null as MeshBasicMaterial,
    inTransition: false,
  };

  // @internal
  public adapter: EquirectangularAdapter;
  private readonly queue = new Queue();

  static withConfig(config: EquirectangularTilesAdapterConfig): [AdapterConstructor, any] {
    return [EquirectangularTilesAdapter, config];
  }

  constructor(viewer: Viewer, config: EquirectangularTilesAdapterConfig) {
    super(viewer);

    this.config = getConfig(config);

    this.adapter = new EquirectangularAdapter(this.viewer, {
      resolution: this.config.resolution,
      blur: this.config.baseBlur,
    });

    this.SPHERE_SEGMENTS = this.config.resolution;
    this.SPHERE_HORIZONTAL_SEGMENTS = this.SPHERE_SEGMENTS / 2;
    this.NB_VERTICES =
      2 * this.SPHERE_SEGMENTS * NB_VERTICES_BY_SMALL_FACE +
      (this.SPHERE_HORIZONTAL_SEGMENTS - 2) * this.SPHERE_SEGMENTS * NB_VERTICES_BY_FACE;
    this.NB_GROUPS = this.SPHERE_SEGMENTS * this.SPHERE_HORIZONTAL_SEGMENTS;

    if (this.viewer.config.requestHeaders) {
      utils.logWarn(
        'EquirectangularTilesAdapter fallbacks to file loader because "requestHeaders" where provided. ' +
          'Consider removing "requestHeaders" if you experience performances issues.',
      );
    }
  }

  override init() {
    super.init();

    this.viewer.addEventListener(events.TransitionDoneEvent.type, this);
    this.viewer.addEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.addEventListener(events.ZoomUpdatedEvent.type, this);
  }

  override destroy() {
    this.viewer.removeEventListener(events.TransitionDoneEvent.type, this);
    this.viewer.removeEventListener(events.PositionUpdatedEvent.type, this);
    this.viewer.removeEventListener(events.ZoomUpdatedEvent.type, this);

    this.__cleanup();

    this.state.errorMaterial?.map?.dispose();
    this.state.errorMaterial?.dispose();
    this.adapter.destroy();

    delete this.adapter;
    delete this.state.geom;
    delete this.state.errorMaterial;

    super.destroy();
  }

  /**
   * @internal
   */
  handleEvent(e: Event) {
    switch (e.type) {
      case events.PositionUpdatedEvent.type:
      case events.ZoomUpdatedEvent.type:
        this.__refresh();
        break;

      case events.TransitionDoneEvent.type:
        this.state.inTransition = false;
        if ((e as events.TransitionDoneEvent).completed) {
          this.__switchMesh(this.viewer.renderer.mesh as Group);
        }
        break;
    }
  }

  override supportsTransition(panorama: EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama) {
    return !!panorama.baseUrl;
  }

  override supportsPreload(panorama: EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama) {
    return !!panorama.baseUrl;
  }

  override textureCoordsToSphericalCoords(point: PanoramaPosition, data: EquirectangularTilesPanoData): Position {
    return this.adapter.textureCoordsToSphericalCoords(point, data);
  }

  override sphericalCoordsToTextureCoords(position: Position, data: EquirectangularTilesPanoData): PanoramaPosition {
    return this.adapter.sphericalCoordsToTextureCoords(position, data);
  }

  override async loadTexture(
    panorama: EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama,
    loader = true,
  ): Promise<EquirectangularTilesTextureData> {
    checkPanoramaConfig(panorama, this);

    const firstTile = getTileConfig(panorama, 0, 0, null, this);
    const panoData: PanoData = {
      isEquirectangular: true,
      fullWidth: firstTile.width,
      fullHeight: firstTile.width / 2,
      croppedWidth: firstTile.width,
      croppedHeight: firstTile.width / 2,
      croppedX: 0,
      croppedY: 0,
      poseHeading: 0,
      posePitch: 0,
      poseRoll: 0,
    };

    if (panorama.baseUrl) {
      const textureData = await this.adapter.loadTexture(panorama.baseUrl, loader, panorama.basePanoData, true);

      return {
        panorama,
        panoData: {
          ...panoData,
          baseData: textureData.panoData,
        },
        cacheKey: textureData.cacheKey,
        texture: textureData.texture,
      };
    } else {
      return {
        panorama,
        panoData: {
          ...panoData,
          baseData: null,
        },
        cacheKey: getCacheKey(panorama, firstTile),
        texture: null,
      };
    }
  }

  createMesh(panoData: EquirectangularTilesPanoData): Group {
    // 基础全景图网格
    const baseMesh = this.adapter.createMesh(panoData.baseData ?? panoData);

    // 瓦片网格
    const geometry = new SphereGeometry(
      CONSTANTS.SPHERE_RADIUS,
      this.SPHERE_SEGMENTS,
      this.SPHERE_HORIZONTAL_SEGMENTS,
      -Math.PI / 2,
    )
      .scale(-1, 1, 1)
      .toNonIndexed() as SphereGeometry;

    geometry.clearGroups();
    let i = 0;
    let k = 0;
    // 第一行
    for (; i < this.SPHERE_SEGMENTS * NB_VERTICES_BY_SMALL_FACE; i += NB_VERTICES_BY_SMALL_FACE) {
      geometry.addGroup(i, NB_VERTICES_BY_SMALL_FACE, k++);
    }
    // 第二行到倒数第二行
    for (; i < this.NB_VERTICES - this.SPHERE_SEGMENTS * NB_VERTICES_BY_SMALL_FACE; i += NB_VERTICES_BY_FACE) {
      geometry.addGroup(i, NB_VERTICES_BY_FACE, k++);
    }
    // 最后一行
    for (; i < this.NB_VERTICES; i += NB_VERTICES_BY_SMALL_FACE) {
      geometry.addGroup(i, NB_VERTICES_BY_SMALL_FACE, k++);
    }

    const materials: MeshBasicMaterial[] = [];
    const material = new MeshBasicMaterial({
      opacity: 0,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    for (let g = 0; g < this.NB_GROUPS; g++) {
      materials.push(material);
    }

    const tilesMesh = new Mesh(geometry, materials);
    tilesMesh.renderOrder = 1;

    const group = new Group();
    group.add(baseMesh);
    group.add(tilesMesh);
    return group;
  }

  /**
   * 应用基础纹理并开始加载瓦片
   */
  setTexture(group: Group, textureData: EquirectangularTilesTextureData, transition: boolean) {
    const [baseMesh] = meshes(group);

    if (textureData.texture) {
      this.adapter.setTexture(baseMesh, {
        panorama: textureData.panorama.baseUrl,
        texture: textureData.texture,
        panoData: textureData.panoData.baseData,
      });
    } else {
      baseMesh.visible = false;
    }

    if (transition) {
      this.state.inTransition = true;
    } else {
      this.__switchMesh(group);
    }
  }

  setTextureOpacity(group: Group, opacity: number) {
    const [baseMesh] = meshes(group);
    this.adapter.setTextureOpacity(baseMesh, opacity);
  }

  disposeTexture({ texture }: EquirectangularTilesTextureData) {
    texture?.dispose();
  }

  disposeMesh(group: Group) {
    const [baseMesh, tilesMesh] = meshes(group);

    baseMesh.geometry.dispose();
    baseMesh.material.dispose();

    tilesMesh.geometry.dispose();
    tilesMesh.material.forEach((m) => {
      m.map?.dispose();
      m.dispose();
    });
  }

  /**
   * 计算并加载可见瓦片
   */
  private __refresh() {
    if (!this.state.geom || this.state.inTransition) {
      return;
    }

    const panorama = this.viewer.config.panorama as EquirectangularTilesPanorama | EquirectangularMultiTilesPanorama;
    const tileConfig = getTileConfig(
      panorama,
      this.viewer.state.hFov,
      this.viewer.state.vFov,
      this.viewer.state.size,
      this,
    );

    const verticesPosition = this.state.geom.getAttribute(ATTR_POSITION) as BufferAttribute;
    const tilesToLoad: Record<string, EquirectangularTile> = {};

    for (let i = 0; i < this.NB_VERTICES; i += 1) {
      vertexPosition.fromBufferAttribute(verticesPosition, i);
      vertexPosition.applyEuler(this.viewer.renderer.sphereCorrection);

      if (this.viewer.renderer.isObjectVisible(vertexPosition)) {
        // 计算片段位置（3 或 6 个顶点）
        let segmentIndex;
        if (i < this.SPHERE_SEGMENTS * NB_VERTICES_BY_SMALL_FACE) {
          // 第一行
          segmentIndex = Math.floor(i / 3);
        } else if (i < this.NB_VERTICES - this.SPHERE_SEGMENTS * NB_VERTICES_BY_SMALL_FACE) {
          // 第二行到倒数第二行
          segmentIndex = Math.floor((i / 3 - this.SPHERE_SEGMENTS) / 2) + this.SPHERE_SEGMENTS;
        } else {
          // 最后一行
          segmentIndex =
            Math.floor((i - this.NB_VERTICES - this.SPHERE_SEGMENTS * NB_VERTICES_BY_SMALL_FACE) / 3) +
            this.SPHERE_HORIZONTAL_SEGMENTS * (this.SPHERE_SEGMENTS - 1);
        }
        const segmentRow = Math.floor(segmentIndex / this.SPHERE_SEGMENTS);
        const segmentCol = segmentIndex - segmentRow * this.SPHERE_SEGMENTS;

        let config = tileConfig;
        while (config) {
          // 计算瓦片位置
          const row = Math.floor(segmentRow / config.facesByRow);
          const col = Math.floor(segmentCol / config.facesByCol);
          let angle = vertexPosition.angleTo(this.viewer.state.direction);
          if (row === 0 || row === config.rows - 1) {
            angle *= 2; // 降低顶部和底部瓦片的优先级
          }

          const tile: EquirectangularTile = {
            row,
            col,
            angle,
            config,
            url: null,
          };
          const id = tileId(tile);

          if (tilesToLoad[id]) {
            tilesToLoad[id].angle = Math.min(tilesToLoad[id].angle, angle);
            break;
          } else {
            tile.url = panorama.tileUrl(col, row, config.level);

            if (tile.url) {
              tilesToLoad[id] = tile;
              break;
            } else {
              // 未返回 URL 时，尝试更低一级的瓦片
              config = getTileConfigByIndex(panorama, config.level - 1, this);
            }
          }
        }
      }
    }

    this.state.tileConfig = tileConfig;
    this.__loadTiles(Object.values(tilesToLoad));
  }

  /**
   * 加载瓦片并调整现有瓦片优先级
   */
  private __loadTiles(tiles: EquirectangularTile[]) {
    this.queue.disableAllTasks();

    tiles.forEach((tile) => {
      const id = tileId(tile);

      if (this.state.tiles[id]) {
        this.queue.setPriority(id, tile.angle);
      } else {
        this.state.tiles[id] = true;
        this.queue.enqueue(new Task(id, tile.angle, (task) => this.__loadTile(tile, task)));
      }
    });

    this.queue.start();
  }

  /**
   * 加载并绘制瓦片
   */
  private __loadTile(tile: EquirectangularTile, task: Task): Promise<any> {
    return this.viewer.textureLoader
      .loadImage(tile.url, null, this.viewer.state.textureData.cacheKey)
      .then((image: HTMLImageElement) => {
        if (!task.isCancelled()) {
          if (this.config.debug) {
            image = buildDebugTexture(image, tile.config.level, tileId(tile)) as any;
          }

          const mipmaps = this.config.antialias && tile.config.level > 0;
          const material = new MeshBasicMaterial({ map: utils.createTexture(image, mipmaps) });
          this.__swapMaterial(tile, material, false);
          this.viewer.needsUpdate();
        }
      })
      .catch((err) => {
        if (!utils.isAbortError(err) && !task.isCancelled() && this.config.showErrorTile) {
          if (!this.state.errorMaterial) {
            this.state.errorMaterial = buildErrorMaterial();
          }
          this.__swapMaterial(tile, this.state.errorMaterial, true);
          this.viewer.needsUpdate();
        }
      });
  }

  /**
   * 将新纹理应用到各个面
   */
  private __swapMaterial(tile: EquirectangularTile, material: MeshBasicMaterial, isError: boolean) {
    const uvs = this.state.geom.getAttribute(ATTR_UV) as BufferAttribute;

    for (let c = 0; c < tile.config.facesByCol; c++) {
      for (let r = 0; r < tile.config.facesByRow; r++) {
        // 面的位置
        const faceCol = tile.col * tile.config.facesByCol + c;
        const faceRow = tile.row * tile.config.facesByRow + r;
        const isFirstRow = faceRow === 0;
        const isLastRow = faceRow === this.SPHERE_HORIZONTAL_SEGMENTS - 1;

        // 该面的第一个顶点（共 3 或 6 个顶点）
        let firstVertex: number;
        if (isFirstRow) {
          firstVertex = faceCol * NB_VERTICES_BY_SMALL_FACE;
        } else if (isLastRow) {
          firstVertex =
            this.NB_VERTICES - this.SPHERE_SEGMENTS * NB_VERTICES_BY_SMALL_FACE + faceCol * NB_VERTICES_BY_SMALL_FACE;
        } else {
          firstVertex =
            this.SPHERE_SEGMENTS * NB_VERTICES_BY_SMALL_FACE +
            (faceRow - 1) * this.SPHERE_SEGMENTS * NB_VERTICES_BY_FACE +
            faceCol * NB_VERTICES_BY_FACE;
        }

        // 发生错误时，如果该面已有可用数据，则跳过
        if (isError && this.state.faces[firstVertex] > ERROR_LEVEL) {
          continue;
        }
        // 如果该面已显示更高分辨率，则跳过
        if (this.state.faces[firstVertex] > tile.config.level) {
          continue;
        }
        this.state.faces[firstVertex] = isError ? ERROR_LEVEL : tile.config.level;

        // 替换材质
        const matIndex = this.state.geom.groups.find((g) => g.start === firstVertex).materialIndex;
        this.state.materials[matIndex] = material;

        // 定义新的 UV
        const top = 1 - r / tile.config.facesByRow;
        const bottom = 1 - (r + 1) / tile.config.facesByRow;
        const left = c / tile.config.facesByCol;
        const right = (c + 1) / tile.config.facesByCol;

        if (isFirstRow) {
          uvs.setXY(firstVertex, (left + right) / 2, top);
          uvs.setXY(firstVertex + 1, left, bottom);
          uvs.setXY(firstVertex + 2, right, bottom);
        } else if (isLastRow) {
          uvs.setXY(firstVertex, right, top);
          uvs.setXY(firstVertex + 1, left, top);
          uvs.setXY(firstVertex + 2, (left + right) / 2, bottom);
        } else {
          uvs.setXY(firstVertex, right, top);
          uvs.setXY(firstVertex + 1, left, top);
          uvs.setXY(firstVertex + 2, right, bottom);
          uvs.setXY(firstVertex + 3, left, top);
          uvs.setXY(firstVertex + 4, left, bottom);
          uvs.setXY(firstVertex + 5, right, bottom);
        }
      }
    }

    uvs.needsUpdate = true;
  }

  private __switchMesh(group: Group) {
    const [, tilesMesh] = meshes(group);

    this.__cleanup();

    this.state.materials = tilesMesh.material;
    this.state.geom = tilesMesh.geometry;

    if (this.config.debug) {
      const wireframe = createWireFrame(this.state.geom);
      this.viewer.renderer.addObject(wireframe);
      this.viewer.renderer.setSphereCorrection(this.viewer.config.sphereCorrection, wireframe);
    }

    setTimeout(() => this.__refresh());
  }

  /**
   * 清空加载队列并释放全部材质
   */
  private __cleanup() {
    this.queue.clear();
    this.state.tiles = {};
    this.state.faces = {};
    this.state.materials = [];
    this.state.inTransition = false;
  }
}

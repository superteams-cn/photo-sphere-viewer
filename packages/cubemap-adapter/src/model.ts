export type CubemapFaces = 'left' | 'front' | 'right' | 'back' | 'top' | 'bottom';

/**
 * 以独立文件定义立方体贴图
 */
export type Cubemap = Record<CubemapFaces, string>;

/**
 * 以独立文件定义立方体贴图
 * 图片顺序为：left、front、right、back、top、bottom
 */
export type CubemapArray = string[];

/**
 * 以独立文件定义立方体贴图
 */
export type CubemapSeparate = {
  type: 'separate';
  paths: Cubemap | CubemapArray;
  /**
   * 如果顶面和底面方向不正确，请设为 true
   * @default false
   */
  flipTopBottom?: boolean;
};

/**
 * 以单条纹文件定义立方体贴图
 */
export type CubemapStripe = {
  type: 'stripe';
  path: string;
  /**
   * 如果顶面和底面方向不正确，请设为 true
   * @default false
   */
  flipTopBottom?: boolean;
  /**
   * 文件中各面的顺序
   * @default 'left, front, right, back, top, bottom'
   */
  order?: CubemapFaces[];
};

/**
 * 以单张网格图定义立方体贴图（十字排列）
 */
export type CubemapNet = {
  type: 'net';
  path: string;
};

/**
 * 立方体贴图配置
 */
export type CubemapPanorama = Cubemap | CubemapArray | CubemapSeparate | CubemapStripe | CubemapNet;

/**
 * 立方体全景图的尺寸信息
 */
export type CubemapData = {
  isCubemap: true;
  flipTopBottom: boolean;
  faceSize: number;
};

export type CubemapAdapterConfig = {
  /**
   * 供立方体瓦片适配器使用
   * @internal
   */
  blur?: boolean;
};

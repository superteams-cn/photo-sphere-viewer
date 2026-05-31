import { TypedEvent, TypedEventTarget } from '../lib/TypedEventTarget';
import { checkVersion, ConfigParser, logWarn } from '../utils';
import type { Viewer } from '../Viewer';

/**
 * 插件基类
 * @template TEvents 派发事件的联合类型
 */
export abstract class AbstractPlugin<
  TEvents extends TypedEvent<AbstractPlugin> = never,
> extends TypedEventTarget<TEvents> {
  /**
   * 插件的唯一标识符
   */
  static readonly id: string;
  /**
   * 期望的核心版本
   * 自定义插件请勿使用
   */
  static readonly VERSION: string;

  constructor(protected viewer: Viewer) {
    super();
  }

  /**
   * 初始化插件
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  init(): void {}

  /**
   * 销毁插件
   */
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  destroy(): void {}
}

/**
 * 可更新配置插件的基类
 * 实现类必须提供静态 `configParser` 属性，其值为 {@link utils.getConfigParser} 的返回结果
 *
 * @template TConfig 输入配置类型
 * @template TParsedConfig 解析后的配置类型
 * @template TUpdatableConfig 可更新配置类型
 * @template TEvents 派发事件的联合类型
 */
export abstract class AbstractConfigurablePlugin<
  TConfig extends Record<string, any>,
  TParsedConfig extends TConfig = TConfig,
  TUpdatableConfig extends TConfig = TConfig,
  TEvents extends TypedEvent<AbstractPlugin> = never,
> extends AbstractPlugin<TEvents> {
  static configParser: ConfigParser<any, any>;
  static readonlyOptions: string[] = [];

  readonly config: TParsedConfig;

  constructor(viewer: Viewer, config: TConfig) {
    super(viewer);

    this.config = (this.constructor as typeof AbstractConfigurablePlugin).configParser(config) as TParsedConfig;
  }

  /**
   * 更新配置项
   */
  setOption<T extends keyof TUpdatableConfig>(option: T, value: TUpdatableConfig[T]) {
    // @ts-ignore
    this.setOptions({ [option]: value });
  }

  /**
   * 更新配置项
   */
  setOptions(options: Partial<TUpdatableConfig>) {
    const rawConfig: TConfig = {
      ...this.config,
      ...options,
    };

    const ctor = this.constructor as typeof AbstractConfigurablePlugin;
    const parser: ConfigParser<TConfig, TParsedConfig> = ctor.configParser as any;
    const readonly = ctor.readonlyOptions;
    const id = ctor.id;

    for (let [key, value] of Object.entries(options) as Array<[keyof TConfig, any]>) {
      if (!(key in parser.defaults)) {
        logWarn(`${id}: 未知选项 "${key as string}"。`);
        continue;
      }

      if (readonly.includes(key as string)) {
        logWarn(`${id}: 选项 "${key as string}" 不能更新。`);
        continue;
      }

      if (key in parser.parsers) {
        value = parser.parsers[key](value, {
          rawConfig: rawConfig,
          defValue: parser.defaults[key],
        });
      }

      this.config[key] = value;
    }
  }
}

export type PluginConstructor = new (viewer: Viewer, config?: any) => AbstractPlugin<any>;

/**
 * 从导入对象中取得插件构造函数
 * @internal
 */
export function pluginInterop(plugin: any): PluginConstructor & typeof AbstractPlugin {
  if (plugin) {
    for (const [, p] of [['_', plugin], ...Object.entries(plugin)]) {
      if (p.prototype instanceof AbstractPlugin) {
        checkVersion(p.id, p.VERSION, PKG_VERSION);
        return p;
      }
    }
  }
  return null;
}

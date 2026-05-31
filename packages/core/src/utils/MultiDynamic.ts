import { Dynamic } from './Dynamic';

/**
 * Wrapper for multiple {@link Dynamic} evolving together
 */
export class MultiDynamic<T extends Record<string, Dynamic>> {
  get current(): Record<keyof T, number> {
    return Object.entries(this.dynamics).reduce(
      (values, [name, dynamic]) => {
        // @ts-ignore
        values[name] = dynamic.current;
        return values;
      },
      {} as Record<keyof T, number>,
    );
  }

  constructor(
    private readonly fn: (val: Record<keyof T, number>) => void,
    private readonly dynamics: T,
  ) {
    if (this.fn) {
      this.fn(this.current);
    }
  }

  /**
   * 修改基础速度
   */
  setSpeed(speed: number) {
    for (const d of Object.values(this.dynamics)) {
      d.setSpeed(speed);
    }
  }

  /**
   * 定义目标位置
   */
  goto(positions: Partial<Record<keyof T, number>>, speedMult = 1) {
    for (const [name, position] of Object.entries(positions)) {
      this.dynamics[name].goto(position as number, speedMult);
    }
  }

  /**
   * 增加或减少目标位置
   */
  step(steps: Partial<Record<keyof T, number>>, speedMult = 1) {
    if (speedMult === 0) {
      this.setValue(
        Object.keys(steps).reduce(
          (values, name: keyof T) => {
            values[name] = steps[name] + this.dynamics[name].current;
            return values;
          },
          {} as typeof steps,
        ),
      );
    } else {
      for (const [name, step] of Object.entries(steps)) {
        this.dynamics[name].step(step as number, speedMult);
      }
    }
  }

  /**
   * Starts infinite movements
   */
  roll(rolls: Partial<Record<keyof T, boolean>>, speedMult = 1) {
    for (const [name, roll] of Object.entries(rolls)) {
      this.dynamics[name].roll(roll, speedMult);
    }
  }

  /**
   * Stops movements
   */
  stop() {
    for (const d of Object.values(this.dynamics)) {
      d.stop();
    }
  }

  /**
   * 定义当前位置并立即停止移动
   */
  setValue(values: Partial<Record<keyof T, number>>): boolean {
    let hasUpdates = false;

    for (const [name, value] of Object.entries(values)) {
      hasUpdates = this.dynamics[name].setValue(value as number) || hasUpdates;
    }

    if (hasUpdates && this.fn) {
      this.fn(this.current);
    }

    return hasUpdates;
  }

  /**
   * @internal
   */
  update(elapsed: number): boolean {
    let hasUpdates = false;

    for (const d of Object.values(this.dynamics)) {
      hasUpdates = d.update(elapsed) || hasUpdates;
    }

    if (hasUpdates && this.fn) {
      this.fn(this.current);
    }

    return hasUpdates;
  }
}

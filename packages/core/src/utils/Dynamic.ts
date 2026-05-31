import { MathUtils } from 'three';
import { PSVError } from '../PSVError';
import { wrap } from './math';

const enum DynamicMode {
  STOP,
  INFINITE,
  POSITION,
}

/**
 * Represents a variable that can dynamically change with time (using requestAnimationFrame)
 */
export class Dynamic {
  private readonly min: number;
  private readonly max: number;
  private readonly wrap: boolean;

  private mode = DynamicMode.STOP;
  private speed = 0;
  private speedMult = 0;
  private currentSpeed = 0;
  private target = 0;
  private __current = 0;

  get current(): number {
    return this.__current;
  }

  private set current(current: number) {
    this.__current = current;
  }

  constructor(
    private readonly fn: (val: number) => void,
    config: {
      min: number;
      max: number;
      defaultValue: number;
      wrap: boolean;
    },
  ) {
    this.min = config.min;
    this.max = config.max;
    this.wrap = config.wrap;
    this.current = config.defaultValue;

    if (this.wrap && this.min !== 0) {
      throw new PSVError('无效配置。');
    }

    if (this.fn) {
      this.fn(this.current);
    }
  }

  /**
   * 修改基础速度
   */
  setSpeed(speed: number) {
    this.speed = speed;
  }

  /**
   * 定义目标位置
   */
  goto(position: number, speedMult = 1) {
    this.mode = DynamicMode.POSITION;
    this.target = this.wrap ? wrap(position, this.max) : MathUtils.clamp(position, this.min, this.max);
    this.speedMult = speedMult;
  }

  /**
   * 增加或减少目标位置
   */
  step(step: number, speedMult = 1) {
    if (speedMult === 0) {
      this.setValue(this.current + step);
    } else {
      if (this.mode !== DynamicMode.POSITION) {
        this.target = this.current;
      }
      this.goto(this.target + step, speedMult);
    }
  }

  /**
   * Starts infinite movement
   */
  roll(invert = false, speedMult = 1) {
    this.mode = DynamicMode.INFINITE;
    this.target = invert ? -Infinity : Infinity;
    this.speedMult = speedMult;
  }

  /**
   * Stops movement
   */
  stop() {
    this.mode = DynamicMode.STOP;
  }

  /**
   * 定义当前位置并立即停止移动
   * @param {number} value
   */
  setValue(value: number): boolean {
    this.target = this.wrap ? wrap(value, this.max) : MathUtils.clamp(value, this.min, this.max);
    this.mode = DynamicMode.STOP;
    this.currentSpeed = 0;
    if (this.target !== this.current) {
      this.current = this.target;
      if (this.fn) {
        this.fn(this.current);
      }
      return true;
    }
    return false;
  }

  /**
   * @internal
   */
  update(elapsed: number): boolean {
    // 位置模式下，进入减速窗口后切换为停止模式
    if (this.mode === DynamicMode.POSITION) {
      // 循环模式下，调整 "current" 以避免跨越原点
      if (this.wrap && Math.abs(this.target - this.current) > this.max / 2) {
        this.current = this.current < this.target ? this.current + this.max : this.current - this.max;
      }

      const dstStop = (this.currentSpeed * this.currentSpeed) / (this.speed * this.speedMult * 4);
      if (Math.abs(this.target - this.current) <= dstStop) {
        this.mode = DynamicMode.STOP;
      }
    }

    // compute speed
    let targetSpeed = this.mode === DynamicMode.STOP ? 0 : this.speed * this.speedMult;
    if (this.target < this.current) {
      targetSpeed = -targetSpeed;
    }
    if (this.currentSpeed < targetSpeed) {
      this.currentSpeed = Math.min(targetSpeed, this.currentSpeed + (elapsed / 1000) * this.speed * this.speedMult * 2);
    } else if (this.currentSpeed > targetSpeed) {
      this.currentSpeed = Math.max(targetSpeed, this.currentSpeed - (elapsed / 1000) * this.speed * this.speedMult * 2);
    }

    // 计算新位置
    let next = null;
    if (this.current > this.target && this.currentSpeed) {
      next = Math.max(this.target, this.current + (this.currentSpeed * elapsed) / 1000);
    } else if (this.current < this.target && this.currentSpeed) {
      next = Math.min(this.target, this.current + (this.currentSpeed * elapsed) / 1000);
    }

    // apply value
    if (next !== null) {
      next = this.wrap ? wrap(next, this.max) : MathUtils.clamp(next, this.min, this.max);
      if (next !== this.current) {
        this.current = next;
        if (this.fn) {
          this.fn(this.current);
        }
        return true;
      }
    }

    return false;
  }
}

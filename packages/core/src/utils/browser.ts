import { Point } from '../model';
import { angle, distance } from './math';

/**
 * 根据未知类型的选择器获取页面元素
 */
export function getElement(selector: string | HTMLElement): HTMLElement {
  if (typeof selector === 'string') {
    return selector.match(/^[a-z]/i) ? document.getElementById(selector) : document.querySelector(selector);
  } else {
    return selector;
  }
}

/**
 * 切换 CSS 类
 */
export function toggleClass(element: Element, className: string, active?: boolean) {
  if (active === undefined) {
    element.classList.toggle(className);
  } else if (active) {
    element.classList.add(className);
  } else if (!active) {
    element.classList.remove(className);
  }
}

/**
 * 为元素添加一个或多个 CSS 类
 */
export function addClasses(element: Element, className: string) {
  element.classList.add(...className.split(' ').filter((c) => !!c));
}

/**
 * 从元素移除一个或多个 CSS 类
 */
export function removeClasses(element: Element, className: string) {
  element.classList.remove(...className.split(' ').filter((c) => !!c));
}

/**
 * 判断元素自身或任意祖先是否为指定父元素
 */
export function hasParent(el: HTMLElement, parent: Element): boolean {
  let test: HTMLElement | null = el;

  do {
    if (test === parent) {
      return true;
    }
    test = test.parentElement;
  } while (test);

  return false;
}

/**
 * 获取最近的匹配父元素（可以是自身）
 */
export function getClosest(el: HTMLElement, selector: string): HTMLElement | null {
  // 当 el 为 document 或 window 时不存在 matches
  if (!el?.matches) {
    return null;
  }

  let test: HTMLElement | null = el;

  do {
    if (test.matches(selector)) {
      return test;
    }
    test = test.parentElement;
  } while (test);

  return null;
}

/**
 * 返回事件 composedPath 中的第一个元素
 */
export function getEventTarget(e: Event): HTMLElement | null {
  return (e?.composedPath()[0] as HTMLElement) || null;
}

/**
 * 返回事件 composedPath 中第一个匹配选择器的元素
 */
export function getMatchingTarget(e: Event, selector: string): HTMLElement | null {
  if (!e) {
    return null;
  }
  return e.composedPath().find((el) => {
    if (!(el instanceof HTMLElement) && !(el instanceof SVGElement)) {
      return false;
    }

    return el.matches(selector);
  }) as HTMLElement;
}

/**
 * 在不触发布局重排的情况下获取元素在视口中的位置
 * 只要没有 CSS transform，结果就与 getBoundingClientRect() 一致
 */
export function getPosition(el: HTMLElement): Point {
  let x = 0;
  let y = 0;
  let test: HTMLElement | null = el;

  while (test) {
    x += test.offsetLeft - test.scrollLeft + test.clientLeft;
    y += test.offsetTop - test.scrollTop + test.clientTop;
    test = test.offsetParent as HTMLElement;
  }

  x -= window.scrollX;
  y -= window.scrollY;

  return { x, y };
}

/**
 * 获取元素样式值
 */
export function getStyleProperty(elt: Element, varname: string): string {
  return window.getComputedStyle(elt).getPropertyValue(varname);
}

export type TouchData = {
  distance: number;
  angle: number;
  center: Point;
};

/**
 * 返回触摸事件前两根手指的距离、角度和中心点
 */
export function getTouchData(e: TouchEvent): TouchData {
  if (e.touches.length < 2) {
    return null;
  }

  const p1 = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  const p2 = { x: e.touches[1].clientX, y: e.touches[1].clientY };

  return {
    distance: distance(p1, p2),
    angle: angle(p1, p2),
    center: { x: (p1.x + p2.x) / 2, y: (p1.y + p2.y) / 2 },
  };
}

let fullscreenElement: HTMLElement;

/**
 * 判断元素是否处于全屏状态
 */
export function isFullscreenEnabled(elt: HTMLElement, isIphone = false): boolean {
  if (isIphone) {
    return elt === fullscreenElement;
  } else {
    return document.fullscreenElement === elt;
  }
}

/**
 * 进入全屏模式
 */
export function requestFullscreen(elt: HTMLElement, isIphone = false) {
  if (isIphone) {
    fullscreenElement = elt;
    elt.classList.add('psv-fullscreen-emulation');
    document.dispatchEvent(new Event('fullscreenchange'));
  } else {
    elt.requestFullscreen();
  }
}

/**
 * 退出全屏模式
 */
export function exitFullscreen(isIphone = false) {
  if (isIphone) {
    fullscreenElement.classList.remove('psv-fullscreen-emulation');
    fullscreenElement = null;
    document.dispatchEvent(new Event('fullscreenchange'));
  } else {
    document.exitFullscreen();
  }
}

/**
 * 支持修饰键的简单按键匹配器
 */
export function keyPressMatch(e: KeyboardEvent, pattern: string) {
  let key: string;
  let shift = false;
  let ctrl = false;
  let alt = false;
  let meta = false;

  if (pattern === '+') {
    key = pattern;
  } else {
    pattern.split('+').forEach((p) => {
      switch (p) {
        case 'Shift':
          shift = true;
          break;
        case 'Ctrl':
          ctrl = true;
          break;
        case 'Alt':
          alt = true;
          break;
        case 'Meta':
          meta = true;
          break;
        case 'Space':
          key = ' ';
          break;
        case 'Plus':
          key = '+';
          break;
        case 'Minus':
          key = '-';
          break;
        default:
          key = p;
          break;
      }
    });
  }

  return shift === e.shiftKey && ctrl === e.ctrlKey && alt === e.altKey && meta === e.metaKey && key === e.key;
}

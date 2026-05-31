/**
 * 返回屏幕方向
 */
export function getOrientation(): 'landscape' | 'portrait' {
  try {
    switch (screen.orientation.type) {
      case 'landscape-primary':
      case 'landscape-secondary':
        return 'landscape';
      case 'portrait-primary':
      case 'portrait-secondary':
        return 'portrait';
      default:
        throw new Error('未知错误');
    }
  } catch {
    if (window.innerHeight > window.innerWidth) {
      return 'portrait';
    } else {
      return 'landscape';
    }
  }
}

/**
 * 等待屏幕进入横屏方向
 */
export function waitLandscape(cb: () => void): any {
  try {
    const listener = () => {
      if (getOrientation() === 'landscape') {
        cb();
      }
    };
    screen.orientation.addEventListener('change', listener);
    return listener;
  } catch {
    return setInterval(() => {
      if (getOrientation() === 'landscape') {
        cb();
      }
    }, 500);
  }
}

/**
 * 取消等待横屏方向
 */
export function cancelWaitLandscape(id: any) {
  if (typeof id === 'number') {
    clearInterval(id);
  } else {
    try {
      screen.orientation.removeEventListener('change', id);
    } catch {
      // empty
    }
  }
}

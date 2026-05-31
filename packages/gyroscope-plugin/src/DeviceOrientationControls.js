import { Euler, MathUtils, Quaternion, Vector3 } from 'three';

const _zee = new Vector3(0, 0, 1);
const _euler = new Euler();
const _q0 = new Quaternion();
const _q1 = new Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5)); // - PI/2 around the x-axis

/**
 * 复制自 three.js examples 中 r134 删除前的版本
 * (deleted because of constructors/OS inconsistencies)
 * @internal
 */
export class DeviceOrientationControls {
  constructor(object, preferAbsolute) {
    if (window.isSecureContext === false) {
      console.error(
        'THREE.DeviceOrientationControls: DeviceOrientationEvent is only available in secure contexts (https)',
      );
    }

    const scope = this; // eslint-disable-line @typescript-eslint/no-this-alias

    const EPS = 0.000001;
    const lastQuaternion = new Quaternion();

    let nonAbsoluteListener = false;

    this.object = object;
    this.object.rotation.reorder('YXZ');

    this.enabled = true;

    this.deviceOrientation = {};
    this.screenOrientation = 0;

    this.alphaOffset = 0; // 弧度

    const onDeviceOrientationChangeEvent = function (event) {
      scope.deviceOrientation = event;
    };

    const onDeviceOrientationAbsoluteChangeEvent = function (event) {
      // 如果支持 'deviceorientationabsolute' 事件，则自动移除 'deviceorientation' 监听器
      if (nonAbsoluteListener) {
        window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent);
        nonAbsoluteListener = false;
      }
      scope.deviceOrientation = event;
    };

    const onScreenOrientationChangeEvent = function () {
      scope.screenOrientation = window.orientation || 0;
    };

    // alpha、beta、gamma 组成一组 Z-X'-Y'' 型内禀 Tait-Bryan 角

    const setObjectQuaternion = function (quaternion, alpha, beta, gamma, orient) {
      _euler.set(beta, alpha, -gamma, 'YXZ'); // 设备使用 'ZXY'，这里使用 'YXZ'

      quaternion.setFromEuler(_euler); // 设置设备方向

      quaternion.multiply(_q1); // 相机从设备背面而不是顶部观察

      quaternion.multiply(_q0.setFromAxisAngle(_zee, -orient)); // 按屏幕方向校正
    };

    this.connect = function () {
      onScreenOrientationChangeEvent(); // 加载时运行一次

      // iOS 13+

      if (
        window.DeviceOrientationEvent !== undefined &&
        typeof window.DeviceOrientationEvent.requestPermission === 'function'
      ) {
        window.DeviceOrientationEvent.requestPermission()
          .then(function (response) {
            if (response === 'granted') {
              window.addEventListener('orientationchange', onScreenOrientationChangeEvent);
              window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent);
              if (preferAbsolute) {
                window.addEventListener('deviceorientationabsolute', onDeviceOrientationAbsoluteChangeEvent);
                nonAbsoluteListener = true;
              }
            }
          })
          .catch(function (error) {
            console.error('THREE.DeviceOrientationControls: Unable to use DeviceOrientation API:', error);
          });
      } else {
        window.addEventListener('orientationchange', onScreenOrientationChangeEvent);
        window.addEventListener('deviceorientation', onDeviceOrientationChangeEvent);
        if (preferAbsolute) {
          window.addEventListener('deviceorientationabsolute', onDeviceOrientationAbsoluteChangeEvent);
          nonAbsoluteListener = true;
        }
      }

      scope.enabled = true;
    };

    this.disconnect = function () {
      window.removeEventListener('orientationchange', onScreenOrientationChangeEvent);
      window.removeEventListener('deviceorientation', onDeviceOrientationChangeEvent);
      window.removeEventListener('deviceorientationabsolute', onDeviceOrientationAbsoluteChangeEvent);
      nonAbsoluteListener = false;

      scope.enabled = false;
    };

    this.update = function () {
      if (scope.enabled === false) return false;

      const device = scope.deviceOrientation;

      if (device) {
        if (!device.alpha && !device.beta && !device.gamma) {
          return false;
        }

        const alpha = device.alpha ? MathUtils.degToRad(device.alpha) + scope.alphaOffset : 0; // Z

        const beta = device.beta ? MathUtils.degToRad(device.beta) : 0; // X'

        const gamma = device.gamma ? MathUtils.degToRad(device.gamma) : 0; // Y''

        const orient = scope.screenOrientation ? MathUtils.degToRad(scope.screenOrientation) : 0; // O

        setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);

        if (8 * (1 - lastQuaternion.dot(scope.object.quaternion)) > EPS) {
          lastQuaternion.copy(scope.object.quaternion);
        }

        return true;
      }

      return false;
    };

    this.dispose = function () {
      scope.disconnect();
    };

    this.connect();
  }
}

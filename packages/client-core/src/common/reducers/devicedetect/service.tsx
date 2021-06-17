import { Dispatch } from 'redux';
import DeviceDetector from 'device-detector-js';
import { getDeviceType } from './actions';

export function detectDeviceType() {
  return (dispatch:Dispatch) => {
    const deviceInfo = { device: {}, WebXRSupported: false, touchDetected: false };

    const deviceDetector = new DeviceDetector();
    deviceInfo.device = deviceDetector.parse(navigator.userAgent);

    if ((navigator as any).xr) {
      (navigator as any).xr.isSessionSupported('immersive-vr').then(isSupported => {
        deviceInfo.WebXRSupported = isSupported;
        dispatch(getDeviceType(deviceInfo));
      });
    }

    if (document && document.addEventListener) {
      const onFirstTouch = () => {
          deviceInfo.touchDetected = true;
          dispatch(getDeviceType(deviceInfo));
          document.removeEventListener('touchstart', onFirstTouch);
      }
      document.addEventListener('touchstart', onFirstTouch);
    }
  }
}
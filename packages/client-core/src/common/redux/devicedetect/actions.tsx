import { DETECT_DEVICE_TYPE } from '../actions';

export interface DeviceDetectState {
  isDetected: boolean;
  content: any;
}

export interface DeviceDetectAction {
  type: string;
  content: any;
}

export function getDeviceType(content: any): DeviceDetectAction {
  return {
    type: DETECT_DEVICE_TYPE,
    content
  };
}

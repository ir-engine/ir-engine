import { DETECT_DEVICE_TYPE } from "../../../user/reducers/actions";
import {Dispatch} from 'redux'


export interface DeviceDetectState {
  isDetected: boolean;
  content: {
    device: any,
    WebXRSupported: boolean,
    touchDetected: boolean
  };
}

export interface DeviceDetectAction {
  type: string;
  content: DeviceDetectState['content'];
}

export function getDeviceType(content:DeviceDetectState['content']) : DeviceDetectAction {
  return {type:DETECT_DEVICE_TYPE, content}
}
import { AframeComponentOptions, AframeComponentInterface } from '../aframe-component'

export interface CameraComponentOptions extends AframeComponentOptions {
  active: boolean,
  far: number,
  fov: number,
  near: number,
  spectator: boolean,
  zoom: number
}

export const defaultCameraComponentOptions: CameraComponentOptions = {
  active: true,
  far: 10000,
  fov: 80,
  near: 0.005,
  spectator: false,
  zoom: 1
}

export default class Camera implements AframeComponentInterface {
  name = 'camera'
  options?: Partial<CameraComponentOptions>

  constructor(options: Partial<CameraComponentOptions> = defaultCameraComponentOptions) {
    this.options = options
  }
}

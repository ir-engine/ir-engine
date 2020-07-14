import { AframeComponentOptions, AframeComponentInterface } from '../aframe-component'

export interface ControlsOptions extends AframeComponentOptions {
}

export interface ControllerComponent extends AframeComponentInterface {
  options?: ControlsOptions
}

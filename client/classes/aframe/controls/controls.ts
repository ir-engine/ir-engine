import { AframeComponentOptions, AframeComponetInterface } from '../aframe-component'

export interface ControlsOptions extends AframeComponentOptions {
}

export interface ControllerComponent extends AframeComponetInterface {
  options?: ControlsOptions
}

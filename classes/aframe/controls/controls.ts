// eslint-disable-next-line no-unused-vars
import { AframeComponentOptions, AframeComponetInterface } from '../aframe-component'

export interface ControlsOptions extends AframeComponentOptions {
}

export interface ControllerComponent extends AframeComponetInterface {
  options?: ControlsOptions
}

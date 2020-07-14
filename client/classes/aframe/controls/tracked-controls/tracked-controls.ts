import { AframeComponentOptions, AframeComponentInterface } from '../../aframe-component'

export interface TrackedControlsOptions extends AframeComponentOptions {
  hand?: string
}

export interface TrackedControllerComponent extends AframeComponentInterface {
  options?: Partial<TrackedControlsOptions>
}

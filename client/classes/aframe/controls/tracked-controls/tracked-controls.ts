import { AframeComponentOptions, AframeComponetInterface } from '../../aframe-component'

export interface TrackedControlsOptions extends AframeComponentOptions {
  hand?: string
}

export interface TrackedControllerComponent extends AframeComponetInterface {
  options?: Partial<TrackedControlsOptions>
}

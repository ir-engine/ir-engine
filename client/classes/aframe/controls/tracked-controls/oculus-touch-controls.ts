import { TrackedControlsOptions, TrackedControllerComponent } from './tracked-controls'

export interface OculusTouchControlsOptions extends TrackedControlsOptions {
  hand?: string
  model?: boolean
  orientationOffset?: any
}

export const defaultOculusTouchControlsOptions: OculusTouchControlsOptions = {
  hand: 'left',
  model: true,
  orientationOffset: { x: 0, y: 0, z: 0 }
}

export default class OculusTouchController implements TrackedControllerComponent {
  name = 'oculus-touch-controls'
  options?: Partial<OculusTouchControlsOptions>

  constructor (options: Partial<OculusTouchControlsOptions> = defaultOculusTouchControlsOptions) {
    this.options = options
  }
}

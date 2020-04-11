// eslint-disable-next-line no-unused-vars
import { ControlsOptions } from './controls'

export interface LookControlsOptions extends ControlsOptions {
  enabled: boolean,
  hmdEnabled: boolean,
  reverseMouseDrag: boolean,
  reverseTouchDrag: boolean,
  touchEnabled: boolean,
  pointerLockEnabled: boolean
}
export const defaultLookControlsOptions: LookControlsOptions = {
  enabled: true,
  hmdEnabled: true,
  reverseMouseDrag: true,
  reverseTouchDrag: false,
  touchEnabled: true,
  pointerLockEnabled: false
}

export default class LookController implements ControlsOptions {
  name = 'look-controls'
  options?: LookControlsOptions

  constructor(options = defaultLookControlsOptions) {
    this.options = options
  }
}

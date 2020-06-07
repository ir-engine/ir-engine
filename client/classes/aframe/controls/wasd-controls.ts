import { ControlsOptions } from './controls'
import Axis from '../../../enums/axis'

export interface WASDControlsOptions extends ControlsOptions {
  acceleration: number,
  adAxis: keyof typeof Axis,
  adInverted: boolean,
  enabled: boolean,
  fly: boolean,
  wsAxis: keyof typeof Axis,
  wsInverted: boolean
}
export const defaultWASDControlsOptions: WASDControlsOptions = {
  acceleration: 65,
  adAxis: 'x',
  adInverted: false,
  enabled: true,
  fly: false,
  wsAxis: 'z',
  wsInverted: false
}

export default class WASDController implements ControlsOptions {
  name = 'wasd-controls'
  options?: WASDControlsOptions

  constructor(options = defaultWASDControlsOptions) {
    this.options = options
  }
}

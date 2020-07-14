import { AframeComponentOptions, AframeComponentInterface } from '../aframe-component'

export interface RaycasterComponentOptions extends AframeComponentOptions {
  autoRefresh: boolean
  // direction: Vector3,
  enabled: boolean
  far: number
  interval: number
  near: number
  objects: string | null
  // origin: Vector3
  showLine: boolean
  useWorldCoordinates: boolean
}

export const defaultRaycasterComponentOptions: RaycasterComponentOptions = {
  autoRefresh: true,
  // direction: 0, 0, -1,
  enabled: true,
  far: Infinity,
  interval: 0,
  near: 0,
  objects: null,
  // origin: 0, 0, 0,
  showLine: false,
  useWorldCoordinates: false
}

export default class Cursor implements AframeComponentInterface {
  name = 'raycaster'
  options?: Partial<RaycasterComponentOptions>

  constructor (options: Partial<RaycasterComponentOptions> = defaultRaycasterComponentOptions) {
    this.options = options
  }
}

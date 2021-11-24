import { Object3D } from 'three'

export default class Volumetric extends Object3D {
  paths: any
  playMode: number
  playModeItems: any
  constructor() {
    super()
    ;(this as any).type = 'volumetric'
    this.paths = []
    this.playMode = 3

    this.playModeItems = [
      {
        label: 'Single',
        value: 1
      },
      {
        label: 'Random',
        value: 2
      },
      {
        label: 'Loop',
        value: 3
      },
      {
        label: 'SingleLoop',
        value: 4
      }
    ]
  }
}

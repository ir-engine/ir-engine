import { Object3D, Ray, Vector3 } from 'three'
import { useEngine } from '../../ecs/classes/Engine'

export class XRUIManager {
  static instance: XRUIManager

  interactionRays = [] as Array<Ray | Object3D>

  constructor(public ethereal: typeof import('ethereal')) {
    this.layoutSystem = this.ethereal.createLayoutSystem(useEngine().camera)
  }

  layoutSystem: import('ethereal').EtherealLayoutSystem
}

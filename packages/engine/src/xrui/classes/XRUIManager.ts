import { Object3D, Ray, Vector3 } from 'three'
import { Engine } from '../../ecs/classes/Engine'

export class XRUIManager {
  static instance: XRUIManager

  interactionRays = [] as Array<Ray | Object3D>

  constructor(public ethereal: typeof import('ethereal')) {
    this.layoutSystem = this.ethereal.createLayoutSystem(Engine.camera)
  }

  layoutSystem: import('ethereal').EtherealLayoutSystem
}

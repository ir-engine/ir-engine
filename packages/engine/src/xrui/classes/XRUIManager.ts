import { Engine } from '../../ecs/classes/Engine'

export class XRUIManager {
  static instance: XRUIManager
  constructor(public ethereal: typeof import('ethereal')) {
    this.layoutSystem = this.ethereal.createLayoutSystem(Engine.camera)
  }
  layoutSystem: import('ethereal').EtherealLayoutSystem
}

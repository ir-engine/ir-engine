import { Engine } from '../../ecs/Engine'

export class XRUIManager {
  static instance: XRUIManager
  constructor(public ethereal: typeof import('ethereal')) {
    this.layoutSystem = this.ethereal.createLayoutSystem(Engine.camera)
  }
  layoutSystem: import('ethereal').EtherealLayoutSystem
}

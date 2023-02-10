import { Object3D, Ray } from 'three'

export class XRUIManager {
  static instance: XRUIManager

  interactionRays = [] as Array<Ray | Object3D>

  constructor(public WebLayerModule: typeof import('@etherealengine/xrui')) {}

  // layoutSystem: import('@etherealengine/xrui').EtherealLayoutSystem
}

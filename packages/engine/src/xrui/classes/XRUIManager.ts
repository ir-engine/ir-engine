import { Object3D, Ray } from 'three'

export class XRUIManager {
  static instance: XRUIManager

  interactionRays = [] as Array<Ray | Object3D>

  constructor(public WebLayerModule: typeof import('@xrengine/xrui')) {}

  // layoutSystem: import('@xrengine/xrui').EtherealLayoutSystem
}

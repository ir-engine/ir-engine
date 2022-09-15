import { WebContainer3D } from '@etherealjs/web-layer/three'

export const XRUIUtils = {
  setUIVisible: (container: WebContainer3D, visibility: boolean) => {
    container.rootLayer.traverse((obj) => {
      obj.visible = visibility
    })
  }
}

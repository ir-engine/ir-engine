import { Line, Mesh, Object3D, Sprite } from 'three'

export function addIsHelperFlag(helperRoot: Object3D) {
  helperRoot.traverse((child) => {
    if ((child as Mesh).isMesh || (child as Line).isLine || (child as Sprite).isSprite) {
      child.userData.isHelper = true
    }
  })
}

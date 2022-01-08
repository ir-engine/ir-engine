import { IcosahedronBufferGeometry, Mesh, MeshBasicMaterial, SphereBufferGeometry } from 'three'

import { addIsHelperFlag } from '@xrengine/engine/src/scene/functions/addIsHelperFlag'

export default class EditorPointLightHelper extends Mesh {
  light: any
  lightDistanceHelper: Mesh
  constructor(light, sphereSize?) {
    const geometry = new SphereBufferGeometry(sphereSize, 4, 2)
    const material = new MeshBasicMaterial({ wireframe: true, fog: false })
    super(geometry, material)
    this.name = 'EditorPointLightHelper'
    this.light = light
    const distanceGeometry = new IcosahedronBufferGeometry(1, 2)
    const distanceMaterial = new MeshBasicMaterial({
      fog: false,
      wireframe: true,
      opacity: 0.1,
      transparent: true
    })
    this.lightDistanceHelper = new Mesh(distanceGeometry, distanceMaterial)
    this.lightDistanceHelper.layers.set(1)
    this.add(this.lightDistanceHelper)
    this.layers.set(1)
    this.update()
    addIsHelperFlag(this)
  }
  dispose() {
    this.geometry.dispose()
    ;(this.material as any).dispose()
    this.lightDistanceHelper.geometry.dispose()
  }
  update() {
    ;(this.material as any).color.copy(this.light.color)
    const d = this.light.distance
    if (d === 0.0) {
      this.lightDistanceHelper.visible = false
    } else {
      this.lightDistanceHelper.visible = true
      this.lightDistanceHelper.scale.set(d, d, d)
    }
  }
}

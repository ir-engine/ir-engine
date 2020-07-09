import * as THREE from 'three'

import { Scale } from 'ecsy-three/src/extras/components'
import { Sky } from 'three/examples/jsm/objects/Sky'

export default function loadSkyboxComponent (scene: any, entity: any, component: any): void {
  const skyComponent = new Sky()
  const distance = component.data.distance // Math.min(1000, component.data.distance)
  const ScaleComp = entity.getMutableComponent(Scale)
  ScaleComp.value = new THREE.Vector3(distance, distance, distance)
  const uniforms = (skyComponent.material as any).uniforms
  const sun = new THREE.Vector3()
  const theta = Math.PI * (component.data.inclination - 0.5)
  const phi = 2 * Math.PI * (component.data.azimuth - 0.5)

  sun.x = Math.cos(phi)
  sun.y = Math.sin(phi) * Math.sin(theta)
  sun.z = Math.sin(phi) * Math.cos(theta)
  uniforms.mieCoefficient.value = component.data.mieCoefficient
  uniforms.mieDirectionalG.value = component.data.mieDirectionalG
  uniforms.rayleigh.value = component.data.rayleigh
  uniforms.turbidity.value = component.data.turbidity
  uniforms.sunPosition.value = sun

  entity.addObject3DComponent(skyComponent, scene)
}

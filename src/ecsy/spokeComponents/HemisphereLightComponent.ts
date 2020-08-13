import * as THREE from 'three'

export default function loadHemisphereLight (scene: any, entity: any, component: any): void {
  const pointLight = new THREE.HemisphereLight(component.data.skyColor, component.data.groundColor, component.data.intensity)
  entity.addObject3DComponent(pointLight, scene)
}

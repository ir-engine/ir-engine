import * as THREE from 'three'

export default function loadPointLight (scene: any, entity: any, component: any): void {
  const pointLight = new THREE.PointLight(component.data.color, component.data.intensity, component.data.distance, component.data.decay)
  entity.addObject3DComponent(pointLight, scene)
}

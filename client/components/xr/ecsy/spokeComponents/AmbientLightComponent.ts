import * as THREE from 'three'

export default function loadAmbientLightNode (scene: any, entity: any, component: any): void {
  const ambientLight = new THREE.AmbientLight(component.data.color, component.data.intensity)
  entity.addObject3DComponent(ambientLight, scene)
}

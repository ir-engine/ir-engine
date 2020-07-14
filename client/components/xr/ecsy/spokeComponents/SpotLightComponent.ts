import * as THREE from 'three'

export default function loadMyNode (scene: any, entity: any, component: any): void {
  const spotLight = new THREE.SpotLight(component.data.color, component.data.intensity,
    component.data.distance, component.data.angle, component.data.penumbra,
    component.data.decay)
  entity.addObject3DComponent(spotLight, scene)
}

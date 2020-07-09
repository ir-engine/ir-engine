import * as THREE from 'three'

export default function loadDirectionalLightComponent (scene: any, entity: any, component: any): void {
  const directionlLight = new THREE.DirectionalLight(component.data.color, component.data.intensity)
  directionlLight.castShadow = true
  directionlLight.shadow.mapSize.set(component.data.shadowMapResolution[0], component.data.shadowMapResolution[1])
  directionlLight.shadow.bias = (component.data.shadowBias)
  directionlLight.shadow.radius = (component.data.shadowRadius)
  entity.addObject3DComponent(directionlLight, scene)
}

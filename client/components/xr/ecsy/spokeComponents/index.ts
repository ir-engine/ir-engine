import loadAmbientLightComponent from './AmbientLightComponent'
import loadDirectionalLightComponent from './DirectionalLightComponent'
// import loadFloorPlaneComponent from './FloorPlaneComponent'
import loadGLTFLoaderComponent from './GLTFModelComponent'
import loadGroundPlaneComponent from './GroundPlaneComponent'
import loadHemisphereLight from './HemisphereLightComponent'
import loadPointLight from './PointLightComponent'
import loadSkyboxComponent from './SkyboxComponent'
import loadTransformComponent from './TransformComponent'
import loadVisibleComponent from './VisibleComponent'
import loadWalkableComponent from './WalkableComponent'

const map: Map<string, (s: any, e: any, c: any) => void> = new Map()

map.set('ambient-light', loadAmbientLightComponent)
map.set('directional-light', loadDirectionalLightComponent)
// map.set('floor-plane', loadFloorPlaneComponent)
map.set('gltf-model', loadGLTFLoaderComponent)
map.set('ground-plane', loadGroundPlaneComponent)
map.set('hemisphere-light', loadHemisphereLight)
map.set('point-light', loadPointLight)
map.set('skybox', loadSkyboxComponent)
map.set('transform', loadTransformComponent)
map.set('visible', loadVisibleComponent)
map.set('walkable', loadWalkableComponent)

export default function SpokeComponentLoader (scene, entity, component): void {
  console.log(map.has(component.name))
  if (!map.has(component.name)) return
  const loadFcn = map.get(component.name)
  loadFcn(scene, entity, component)
}

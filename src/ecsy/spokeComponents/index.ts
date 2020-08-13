import { GLTFLoader, Parent } from "ecsy-three/src/extras/components"
import * as THREE from "three"
import { AmbientLight } from "three"
import { WorldComponent } from "../../common"
import { addObject3DComponent } from "../../common/defaults/behaviors/Object3DBehaviors"
import { Component } from "../../ecs"
import CollidableTagComponent from "../components/Collidable"
import Image from "../components/Image"
import loadAmbientLightComponent from "./AmbientLightComponent"
import loadCollidableComponent from "./CollidableComponent"
import loadDirectionalLightComponent from "./DirectionalLightComponent"
// import loadFloorPlaneComponent from './FloorPlaneComponent'
import loadGLTFLoaderComponent from "./GLTFModelComponent"
import loadGroundPlaneComponent from "./GroundPlaneComponent"
import loadHemisphereLight from "./HemisphereLightComponent"
import loadImageComponent from "./ImageComponent"
import loadPointLight from "./PointLightComponent"
import loadSkyboxComponent from "./SkyboxComponent"
import loadSpotLight from "./SpotLightComponent"
import loadTransformComponent from "./TransformComponent"
import loadVisibleComponent from "./VisibleComponent"
import loadWalkableComponent from "./WalkableComponent"

const map: Map<string, (e: any, c: any) => void> = new Map()

map.set("ambient-light", loadAmbientLightComponent)
map.set("directional-light", loadDirectionalLightComponent)
map.set("collidable", loadCollidableComponent)
// map.set('floor-plane', loadFloorPlaneComponent)
map.set("gltf-model", loadGLTFLoaderComponent)
map.set("ground-plane", loadGroundPlaneComponent)
map.set("hemisphere-light", loadHemisphereLight)
map.set("image", loadImageComponent)
map.set("point-light", loadPointLight)
map.set("skybox", loadSkyboxComponent)
map.set("spot-light", loadSpotLight)
map.set("transform", loadTransformComponent)
map.set("visible", loadVisibleComponent)
map.set("walkable", loadWalkableComponent)

interface ComponentAndData {
  components?: any
  behaviors?: any
}

interface LoadingSchema {
  [key: string]: {
    components?: {
      type: Component<any>
      values?: any
    }[]
    behaviors?: {
      behavior: any
      args?: any
      values?: any
    }[]
  }
}

interface SceneComponent {}

const SceneObjectLoadingSchema: LoadingSchema = {
  ["ambient-light"]: {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj: AmbientLight },
        values: ["color", "intensity"]
      }
    ]
  },
  ["image"]: {
    behaviors: [
      {
        behavior: addObject3DComponent,
        args: { obj: Image },
        values: ["src", "projection", "parent"]
      }
    ]
  }
}

export function loadScene(scene) {
  Object.keys(scene.entities).forEach(key => {
    const sceneEntity = scene.entities[key]
    const entity = WorldComponent.instance.world.createEntity("scene_" + sceneEntity.id)
    entity.addComponent(SceneObjectTag)
    sceneEntity.components.forEach(component => {
      console.log(component.name)
      loadComponent(entity, component.data)
    })
  })
}

export function loadComponent(entity, component) {
  if (SceneObjectLoadingSchema[component.name] === undefined) return console.warn("Couldn't load ", component.name)
  const componentSchema = SceneObjectLoadingSchema[component.name]
  // for each component in component name, call behavior
  componentSchema.behaviors.forEach(b => {
    // For each value, from component.data
    const values = b.values ? b.values.map(val => component.data[val]) : {}
    // Invoke behavior with args and spread args
    b.behavior(entity, { ...b.args, ...values })
  })
  // for each component in component name, add copmponent
  componentSchema.components.forEach(c => {
    // For each value, from component.data, add to args object
    const values = c.values ? c.values.map(val => component.data[val]) : {}
    // Add component with args
    entity.addComponent(c.type, values)
  })
}

export default function loadImageComponent(scene: any, entity: any, component: any): void {
  entity.addComponent(Image, {
    src: component.data.src,
    projection: component.data.projection,
    parent: scene
  })
}

export default function loadHemisphereLight(scene: any, entity: any, component: any): void {
  const pointLight = new THREE.HemisphereLight(
    component.data.skyColor,
    component.data.groundColor,
    component.data.intensity
  )
  entity.addObject3DComponent(pointLight, scene)
}

export default function loadGroundPlaneComponent(scene: any, entity: any, component: any): void {
  const groundPlaneGeometry = new THREE.PlaneGeometry(40000, 40000)
  const groundPlaneMaterial = new THREE.MeshBasicMaterial({ color: component.data.color, side: THREE.DoubleSide })
  const plane = new THREE.Mesh(groundPlaneGeometry, groundPlaneMaterial)
  plane.rotateX(180)
  entity.addObject3DComponent(plane, scene)
}

export default function loadGLTFModelComponent(scene: any, entity: any, component: any): void {
  entity
    .addComponent(GLTFLoader, {
      url: component.data.src,
      onLoaded: () => {
        console.log("gltf loaded")
      }
    })
    .addComponent(Parent, { value: scene })
}

export default function loadDirectionalLightComponent(scene: any, entity: any, component: any): void {
  const directionlLight = new THREE.DirectionalLight(component.data.color, component.data.intensity)
  directionlLight.castShadow = true
  directionlLight.shadow.mapSize.set(component.data.shadowMapResolution[0], component.data.shadowMapResolution[1])
  directionlLight.shadow.bias = component.data.shadowBias
  directionlLight.shadow.radius = component.data.shadowRadius
  entity.addObject3DComponent(directionlLight, scene)
}

export default function loadCollidableComponent(scene: any, entity: any, component: any): void {
  entity.addComponent(CollidableTagComponent, scene)
}

export default function loadAmbientLightNode(entity: any, component: any): void {
  const ambientLight = new THREE.AmbientLight(component.data.color, component.data.intensity)
  entity.addObject3DComponent(ambientLight, scene)
}

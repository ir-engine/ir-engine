/* eslint-disable no-case-declarations */
import React, { useEffect } from 'react'
// import { Component, System, TagComponent } from 'ecsy'
import { connect } from 'react-redux'
import {
  Object3DComponent,
  ECSYThreeWorld
} from 'ecsy-three'
import {
  initialize
} from 'ecsy-three/src/extras'
import {
  GLTFLoader,
  Parent,
  Position,
  Rotation,
  Scale,
  //   Scene,
  SkyBox,
  Visible
//   WebGLRenderer
} from 'ecsy-three/src/extras/components'
// import {
//   SkyBoxSystem
// } from 'ecsy-three/src/extras/systems/SkyBoxSystem'
import { GLTFLoaderSystem } from 'ecsy-three/src/extras/systems/GLTFLoaderSystem'
import * as THREE from 'three'
import {
  Sky
} from 'three/examples/jsm/objects/Sky'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// import { ImageLoader } from 'three/src/loaders/ImageLoader'
import { client } from '../../../redux/feathers'

import _ from 'lodash'

const projectRegex = /\/([A-Za-z0-9]+)\/([a-f0-9-]+)$/

interface Props {
  projectId: string
}

const mapStateToProps = (state: any): Partial<Props> => {
  return {
  }
}

const mapDispatchToProps = (): Partial<Props> => ({
})

async function init (projectId: string): Promise<any> { // auth: any,
  let lastTime = 0
  const world = new ECSYThreeWorld()
  world.registerComponent(Position)
    .registerComponent(SkyBox)
    .registerComponent(Parent)
    .registerComponent(GLTFLoader)
    .registerComponent(Rotation)
    .registerComponent(Scale)
    .registerComponent(Visible)
  world.registerSystem(GLTFLoaderSystem)
  const data = initialize(world)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { scene, camera, renderer } = data.entities
  const camera3d = camera.getObject3D()
  camera3d.position.z = 5
  document.onkeydown = (e) => {
    const camera3dObjectComponent = camera.getMutableComponent(Object3DComponent).value
    switch (e.keyCode) {
      case 37:
        camera3dObjectComponent.position.x -= 0.5
        break
      case 38:
        camera3dObjectComponent.position.z -= 0.5
        break
      case 39:
        (camera3dObjectComponent.position.x as number) += 0.5
        break
      case 40:
        (camera3dObjectComponent.position.z as number) += 0.5
        break
    }
  }

  let service, serviceId
  const projectResult = await client.service('project').get(projectId)
  const projectUrl = projectResult.project_url
  const regexResult = projectUrl.match(projectRegex)
  if (regexResult) {
    service = regexResult[1]
    serviceId = regexResult[2]
  }
  const result = await client.service(service).get(serviceId)
  Object.keys(result.entities).forEach((key) => {
    const entity = result.entities[key]
    const newEntity = world.createEntity(entity.id)
    entity.components.forEach((component) => {
      console.log(component.name)
      console.log(component)
      switch (component.name) {
        case 'skybox':
          const skyComponent = new Sky()
          const distance = component.data.distance // Math.min(1000, component.data.distance)
          const ScaleComp = newEntity.getMutableComponent(Scale);
          (ScaleComp as any).value = new THREE.Vector3(distance, distance, distance)
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

          console.log(skyComponent)

          newEntity.addObject3DComponent(skyComponent, scene)
          // .addComponent(Parent, { value: scene })
          // scene3d.add(skyComponent)
          break
        case 'transform':
          newEntity.addComponent(Position, { value: component.data.position })
          newEntity.addComponent(Rotation, { rotation: component.data.rotation })
          newEntity.addComponent(Scale, { value: component.data.scale })
          break
        case 'visible':
          newEntity.addComponent(Visible, { value: component.data.visible })
          break
        case 'directional-light':
          const directionlLight = new THREE.DirectionalLight(component.data.color, component.data.intensity)
          directionlLight.castShadow = true
          directionlLight.shadow.mapSize.set(component.data.shadowMapResolution[0], component.data.shadowMapResolution[1])
          directionlLight.shadow.bias = (component.data.shadowBias)
          directionlLight.shadow.radius = (component.data.shadowRadius)
          newEntity.addObject3DComponent(directionlLight, scene)
          break
        case 'gltf-model':
          newEntity.addComponent(GLTFLoader, {
            url: component.data.src
          })
            .addComponent(Parent, { value: scene })
          console.log(newEntity)
          break
        case 'ground-plane':
          const geometry = new THREE.PlaneGeometry(40000, 40000)
          const material = new THREE.MeshBasicMaterial({ color: component.data.color, side: THREE.DoubleSide })
          const plane = new THREE.Mesh(geometry, material)
          plane.rotateX(180)
          newEntity.addObject3DComponent(plane, scene)
          break
        case 'ambient-light':
          const ambientLight = new THREE.AmbientLight(component.data.color, component.data.intensity)
          newEntity.addObject3DComponent(ambientLight, scene)
          break
        default:
          break
      }
    })
    console.log(newEntity)
  })
  console.log(world)
  const time = performance.now()
  const delta = time - lastTime
  world.execute(delta, time)
  lastTime = time
}

const EcsyComponent: React.FC<Props> = (props: Props) => {
  useEffect(() => {
    const { projectId } = props
    init(projectId).catch((e) => { console.log(e) })
  }, [])

  return (<div/>)
}

const EcsyComponentWrapper: React.FC<Props> = (props: any) => {
  return <EcsyComponent {...props} />
}

export default connect(mapStateToProps, mapDispatchToProps)(EcsyComponentWrapper)

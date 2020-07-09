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
  Visible,
  //   WebGLRenderer
  Camera
} from 'ecsy-three/src/extras/components'
import { GLTFLoaderSystem } from 'ecsy-three/src/extras/systems/GLTFLoaderSystem'

import SpokeNodeLoader from '../ecsy/spokeComponents'

import Walkable from '../ecsy/components/Walkable'

import CameraSystem from '../ecsy/systems/CameraSystem'
// import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
// import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader'
// import { ImageLoader } from 'three/src/loaders/ImageLoader'
import { client } from '../../../redux/feathers'

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
    .registerComponent(Walkable)
  world.registerSystem(GLTFLoaderSystem)
    .registerSystem(CameraSystem)
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
  const cameraComp = camera.getMutableComponent(Camera)
  cameraComp.far = 100000000000

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
      SpokeNodeLoader(scene, newEntity, component)
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

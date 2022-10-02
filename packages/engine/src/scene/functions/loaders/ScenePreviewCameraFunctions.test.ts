import assert from 'assert'
import proxyquire from 'proxyquire'
import { Matrix4, Object3D, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { addEntityNodeChild, createEntityNode } from '../../../ecs/functions/EntityTree'
import { createEngine } from '../../../initializeEngine'
import { setTransformComponent, TransformComponent } from '../../../transform/components/TransformComponent'

const EPSILON = 10e-8

describe('ScenePreviewCameraFunctions', () => {
  let entity: Entity
  let scenePreviewCameraFunctions = proxyquire('./ScenePreviewCameraFunctions', {
    '../../../common/functions/isClient': { isClient: true }
  })

  beforeEach(() => {
    createEngine()
    Engine.instance.isEditor = false
    entity = createEntity()
    const node = createEntityNode(entity)
    const world = Engine.instance.currentWorld
    addEntityNodeChild(node, world.entityTree.rootNode)
  })

  // describe('updateScenePreviewCamera()', () => {
  //   it('should set view port of preview camera to active camera', () => {
  //     Engine.instance.isEditor = true

  //     addComponent(entity, ScenePreviewCameraComponent, true)

  //     Engine.instance.currentWorld.camera = new PerspectiveCamera()
  //     Engine.instance.currentWorld.camera.position.set(1, 2, 3)
  //     Engine.instance.currentWorld.camera.rotation.set(4, 5, 6)
  //     Engine.instance.currentWorld.camera.scale.set(7, 8, 9)
  //     Engine.instance.currentWorld.camera.updateMatrixWorld()

  //     const parent = new Object3D()
  //     parent.add(getComponent(entity, Object3DComponent)?.value)

  //     parent.position.set(11, 12, 13)
  //     parent.rotation.set(14, 15, 16)
  //     parent.scale.set(17, 18, 19)
  //     parent.updateMatrixWorld()

  //     // Precalculated Data
  //     const position = new Vector3(0.07576189567072067, 0.6324818328987092, -0.6836645593458517)
  //     const rotation = new Quaternion(-0.2654950189527386, -0.8092447619586716, -0.0754805949334258, 0.5215735287967833)
  //     const scale = new Vector3(0.37537072742024163, 0.45089401115237876, 0.5142213055127867)

  //     scenePreviewCameraFunctions.updateCameraTransform(entity)
  //     const transform = getComponent(entity, TransformComponent)
  //     console.log(transform.position.x, position.x)
  //     assert(Math.abs(transform.position.x - position.x) < EPSILON)
  //     assert(Math.abs(transform.position.y - position.y) < EPSILON)
  //     assert(Math.abs(transform.position.z - position.z) < EPSILON)

  //     assert(Math.abs(transform.rotation.x - rotation.x) < EPSILON)
  //     assert(Math.abs(transform.rotation.y - rotation.y) < EPSILON)
  //     assert(Math.abs(transform.rotation.z - rotation.z) < EPSILON)

  //     assert(Math.abs(transform.scale.x - scale.x) < EPSILON)
  //     assert(Math.abs(transform.scale.y - scale.y) < EPSILON)
  //     assert(Math.abs(transform.scale.z - scale.z) < EPSILON)

  //     Engine.instance.isEditor = false
  //   })
  // })
})

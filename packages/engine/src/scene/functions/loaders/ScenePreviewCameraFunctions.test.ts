import assert from 'assert'
import proxyquire from 'proxyquire'
import { Object3D, PerspectiveCamera, Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { ScenePreviewCameraTagComponent } from '../../components/ScenePreviewCamera'
import { SCENE_COMPONENT_SCENE_PREVIEW_CAMERA, SCENE_PREVIEW_CAMERA_HELPER } from './ScenePreviewCameraFunctions'

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
    addComponent(entity, TransformComponent, {
      position: new Vector3(Math.random(), Math.random(), Math.random()),
      rotation: new Quaternion(Math.random(), Math.random(), Math.random(), Math.random()),
      scale: new Vector3(Math.random(), Math.random(), Math.random())
    })
  })

  const sceneComponentData = {}

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_SCENE_PREVIEW_CAMERA,
    props: sceneComponentData
  }

  describe('deserializeScenePreviewCamera()', () => {
    it('does not create ScenePreviewCamera Component while not on client side', () => {
      const _scenePreviewCameraFunctions = proxyquire('./ScenePreviewCameraFunctions', {
        '../../../common/functions/isClient': { isClient: false }
      })
      _scenePreviewCameraFunctions.deserializeScenePreviewCamera(entity, sceneComponent)

      const scenePreviewCameraComponent = getComponent(entity, ScenePreviewCameraTagComponent)
      assert(!scenePreviewCameraComponent)
    })

    it('creates ScenePreviewCamera Component with provided component data', () => {
      scenePreviewCameraFunctions.deserializeScenePreviewCamera(entity, sceneComponent)

      const scenePreviewCameraComponent = getComponent(entity, ScenePreviewCameraTagComponent)
      assert(scenePreviewCameraComponent)
      assert(Object.keys(scenePreviewCameraComponent).length === 0)
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      scenePreviewCameraFunctions.deserializeScenePreviewCamera(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_SCENE_PREVIEW_CAMERA))
    })

    describe('Editor vs Location', () => {
      it('creates ScenePreviewCamera in Location', () => {
        Engine.instance.activeCameraEntity = createEntity()
        Engine.instance.camera = new PerspectiveCamera()

        scenePreviewCameraFunctions.deserializeScenePreviewCamera(entity, sceneComponent)

        assert(Engine.instance.camera.position.equals(getComponent(entity, TransformComponent).position))
      })

      it('creates ScenePreviewCamera in Editor', () => {
        Engine.instance.isEditor = true

        scenePreviewCameraFunctions.deserializeScenePreviewCamera(entity, sceneComponent)

        const obj3d = getComponent(entity, Object3DComponent)?.value
        assert(obj3d && obj3d instanceof PerspectiveCamera)
        assert(obj3d.userData.helper && obj3d.userData.helper.name === SCENE_PREVIEW_CAMERA_HELPER)
        Engine.instance.isEditor = false
      })
    })
  })

  describe('updateScenePreviewCamera()', () => {
    it('should set view port of preview camera to active camera', () => {
      Engine.instance.isEditor = true

      scenePreviewCameraFunctions.deserializeScenePreviewCamera(entity, sceneComponent)

      Engine.instance.camera = new PerspectiveCamera()
      Engine.instance.camera.position.set(1, 2, 3)
      Engine.instance.camera.rotation.set(4, 5, 6)
      Engine.instance.camera.scale.set(7, 8, 9)
      Engine.instance.camera.updateMatrixWorld()

      const parent = new Object3D()
      parent.add(getComponent(entity, Object3DComponent)?.value)

      parent.position.set(11, 12, 13)
      parent.rotation.set(14, 15, 16)
      parent.scale.set(17, 18, 19)
      parent.updateMatrixWorld()

      // Precalculated Data
      const position = new Vector3(0.07576189567072067, 0.6324818328987092, -0.6836645593458517)
      const rotation = new Quaternion(-0.2654950189527386, -0.8092447619586716, -0.0754805949334258, 0.5215735287967833)
      const scale = new Vector3(0.37537072742024163, 0.45089401115237876, 0.5142213055127867)

      scenePreviewCameraFunctions.updateCameraTransform(entity)
      const transform = getComponent(entity, TransformComponent)

      assert(Math.abs(transform.position.x - position.x) < EPSILON)
      assert(Math.abs(transform.position.y - position.y) < EPSILON)
      assert(Math.abs(transform.position.z - position.z) < EPSILON)

      assert(Math.abs(transform.rotation.x - rotation.x) < EPSILON)
      assert(Math.abs(transform.rotation.y - rotation.y) < EPSILON)
      assert(Math.abs(transform.rotation.z - rotation.z) < EPSILON)

      assert(Math.abs(transform.scale.x - scale.x) < EPSILON)
      assert(Math.abs(transform.scale.y - scale.y) < EPSILON)
      assert(Math.abs(transform.scale.z - scale.z) < EPSILON)

      Engine.instance.isEditor = false
    })
  })

  describe('serializeScenePreviewCamera()', () => {
    it('should properly serialize scenePreviewCamera', () => {
      scenePreviewCameraFunctions.deserializeScenePreviewCamera(entity, sceneComponent)
      assert.deepEqual(scenePreviewCameraFunctions.serializeScenePreviewCamera(entity), sceneComponent)
    })

    it('should return undefine if there is no scenePreviewCamera component', () => {
      assert(scenePreviewCameraFunctions.serializeScenePreviewCamera(entity) === undefined)
    })
  })

  describe('shouldDeserializeScenePreviewCamera()', () => {
    it('should return true if there is no scene preview camera component in the world', () => {
      assert(scenePreviewCameraFunctions.shouldDeserializeScenePreviewCamera())
    })

    it('should return false if there is atleast one scene preview camera component in the world', () => {
      scenePreviewCameraFunctions.deserializeScenePreviewCamera(entity, sceneComponent)
      assert(!scenePreviewCameraFunctions.shouldDeserializeScenePreviewCamera())
    })
  })
})

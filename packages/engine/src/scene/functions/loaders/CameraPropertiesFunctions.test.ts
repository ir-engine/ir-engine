import assert from 'assert'
import proxyquire from 'proxyquire'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { CameraMode } from '../../../camera/types/CameraMode'
import { ProjectionType } from '../../../camera/types/ProjectionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { CameraPropertiesComponent } from '../../components/CameraPropertiesComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import {
  SCENE_COMPONENT_CAMERA_PROPERTIES,
  SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES
} from './CameraPropertiesFunctions'

describe('CameraPropertiesFunctions', () => {
  let entity: Entity
  let camerapropertiesFunctions = proxyquire('./CameraPropertiesFunctions', {
    '../../../common/functions/isClient': { isClient: true },
    '../setCameraProperties': { setCameraProperties: () => {} },
    '../../../networking/functions/matchActionOnce': {
      matchActionOnce: (store, _, callback: Function) => {
        assert(callback({ $from: Engine.instance.userId }), 'Camera property is not set')
        assert(!callback({ $from: Engine.instance.userId + 'fake' }), 'Camera property is set')
      }
    }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    fov: Math.random(),
    cameraNearClip: Math.random(),
    cameraFarClip: Math.random(),
    projectionType: ProjectionType.Orthographic,
    minCameraDistance: Math.random(),
    maxCameraDistance: Math.random(),
    startCameraDistance: Math.random(),
    cameraMode: CameraMode.ShoulderCam,
    cameraModeDefault: CameraMode.Strategic,
    startInFreeLook: true,
    minPhi: Math.random(),
    maxPhi: Math.random(),
    startPhi: Math.random(),
    raycastProps: {
      enabled: Math.random() > 0.5,
      rayCount: Math.floor(Math.random() * 10),
      rayLength: Math.random() * 100,
      rayFrequency: Math.random()
    }
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_CAMERA_PROPERTIES,
    props: sceneComponentData
  }

  describe('deserializeCameraProperties()', () => {
    it('creates CameraProperties Component with provided component data', () => {
      camerapropertiesFunctions.deserializeCameraProperties(entity, sceneComponent)

      const camerapropertiesComponent = getComponent(entity, CameraPropertiesComponent)
      assert(camerapropertiesComponent)
      assert.deepEqual(camerapropertiesComponent, sceneComponentData)
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      camerapropertiesFunctions.deserializeCameraProperties(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_CAMERA_PROPERTIES))
    })
  })

  describe('serializeCameraProperties()', () => {
    it('should properly serialize cameraproperties', () => {
      camerapropertiesFunctions.deserializeCameraProperties(entity, sceneComponent)
      assert.deepEqual(camerapropertiesFunctions.serializeCameraProperties(entity), sceneComponent)
    })

    it('should return undefine if there is no cameraproperties component', () => {
      assert(camerapropertiesFunctions.serializeCameraProperties(entity) === undefined)
    })
  })

  describe('parseCameraPropertiesProperties()', () => {
    it('should use default component values', () => {
      const componentData = camerapropertiesFunctions.parseCameraPropertiesProperties({})
      assert.deepEqual(componentData, SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES)
    })

    it('should use passed values', () => {
      const componentData = camerapropertiesFunctions.parseCameraPropertiesProperties({ ...sceneComponentData })
      assert.deepEqual(componentData, sceneComponentData)
    })
  })
})

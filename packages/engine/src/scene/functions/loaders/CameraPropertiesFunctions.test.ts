import assert from 'assert'
import proxyquire from 'proxyquire'

import { CameraMode } from '../../../camera/types/CameraMode'
import { ProjectionType } from '../../../camera/types/ProjectionType'
import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import {
  CameraPropertiesComponent,
  SCENE_COMPONENT_CAMERA_PROPERTIES,
  SCENE_COMPONENT_CAMERA_PROPERTIES_DEFAULT_VALUES
} from '../../components/CameraPropertiesComponent'

describe('CameraPropertiesFunctions', () => {
  let entity: Entity
  let camerapropertiesFunctions = proxyquire('./CameraPropertiesFunctions', {
    '../../../common/functions/isClient': { isClient: true },
    '../setCameraProperties': { setCameraProperties: () => {} },
    '../../../networking/functions/matchActionOnce': {
      matchActionOnce: (_, callback: Function) => {
        console.log(callback)
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

  describe('deserializeCameraProperties()', () => {
    it('creates CameraProperties Component with provided component data', () => {
      camerapropertiesFunctions.deserializeCameraProperties(entity, sceneComponentData)

      const camerapropertiesComponent = getComponent(entity, CameraPropertiesComponent)
      assert(camerapropertiesComponent)
      assert.deepEqual(camerapropertiesComponent, sceneComponentData)
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

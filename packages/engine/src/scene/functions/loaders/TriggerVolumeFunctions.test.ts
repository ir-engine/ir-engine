import assert from 'assert'
import proxyquire from 'proxyquire'
import { Mesh, MeshBasicMaterial } from 'three'
import { Quaternion, Vector3 } from 'three'

import { ComponentJson } from '@xrengine/common/src/interfaces/SceneInterface'

import { Engine } from '../../../ecs/classes/Engine'
import { Entity } from '../../../ecs/classes/Entity'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { ColliderComponent } from '../../../physics/components/ColliderComponent'
import { TransformComponent, TransformComponentType } from '../../../transform/components/TransformComponent'
import { EntityNodeComponent } from '../../components/EntityNodeComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { TriggerVolumeComponent } from '../../components/TriggerVolumeComponent'
import { SCENE_COMPONENT_TRIGGER_VOLUME } from './TriggerVolumeFunctions'

describe('TriggerVolumeFunctions', () => {
  let entity: Entity
  let triggervolumeFunctions = proxyquire('./TriggerVolumeFunctions', {
    '../../../physics/functions/createCollider': { createCollider: () => {} }
  })

  beforeEach(() => {
    createEngine()
    entity = createEntity()
  })

  const sceneComponentData = {
    onEnter: () => {},
    onExit: () => {},
    target: () => {}
  }

  const sceneComponent: ComponentJson = {
    name: SCENE_COMPONENT_TRIGGER_VOLUME,
    props: sceneComponentData
  }

  describe('deserializeTriggerVolume()', () => {
    it('creates TriggerVolume Component with provided component data', () => {
      triggervolumeFunctions.deserializeTriggerVolume(entity, sceneComponent)

      const triggervolumeComponent = getComponent(entity, TriggerVolumeComponent)
      assert.deepEqual(triggervolumeComponent, { ...sceneComponentData, active: true })

      const obj3d = getComponent(entity, Object3DComponent)?.value as Mesh<any, MeshBasicMaterial>
      assert(obj3d && obj3d.material.visible === false, 'TriggerVolume outline is not disabled')
      assert(obj3d && obj3d.userData.isHelper, 'TriggerVolume outline is not disabled')
    })

    it('will include this component into EntityNodeComponent', () => {
      addComponent(entity, EntityNodeComponent, { components: [] })

      triggervolumeFunctions.deserializeTriggerVolume(entity, sceneComponent)

      const entityNodeComponent = getComponent(entity, EntityNodeComponent)
      assert(entityNodeComponent.components.includes(SCENE_COMPONENT_TRIGGER_VOLUME))
    })
  })

  describe('updateTriggerVolume()', () => {
    let transform1: TransformComponentType
    let transform2: any
    beforeEach(() => {
      transform1 = {
        position: new Vector3(Math.random(), Math.random(), Math.random()),
        rotation: new Quaternion(Math.random(), Math.random(), Math.random(), Math.random()),
        scale: new Vector3(Math.random(), Math.random(), Math.random())
      }

      transform2 = {
        translation: new Vector3(Math.random(), Math.random(), Math.random()),
        rotation: new Quaternion(Math.random(), Math.random(), Math.random(), Math.random())
      }

      addComponent(entity, TransformComponent, transform1)
      addComponent(entity, ColliderComponent, {
        // @ts-ignore
        body: {
          getGlobalPose: () => transform2,
          setGlobalPose: (t) => (transform2 = t),
          _debugNeedsUpdate: false
        }
      })
    })

    it('should not update collider body', () => {
      Engine.instance.isEditor = true
      triggervolumeFunctions.deserializeTriggerVolume(entity, sceneComponent)
      triggervolumeFunctions.updateTriggerVolume(entity)

      const collider = getComponent(entity, ColliderComponent)
      assert.deepEqual(collider.body.getGlobalPose(), {
        translation: transform1.position,
        rotation: transform1.rotation
      })
      assert(collider.body._debugNeedsUpdate)
    })
  })

  describe('serializeTriggerVolume()', () => {
    it('should properly serialize triggervolume', () => {
      triggervolumeFunctions.deserializeTriggerVolume(entity, sceneComponent)
      assert.deepEqual(triggervolumeFunctions.serializeTriggerVolume(entity), sceneComponent)
    })

    it('should return undefine if there is no triggervolume component', () => {
      assert(triggervolumeFunctions.serializeTriggerVolume(entity) === undefined)
    })
  })
})

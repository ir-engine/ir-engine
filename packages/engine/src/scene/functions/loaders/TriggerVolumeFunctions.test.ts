import assert from 'assert'
import { Mesh, MeshBasicMaterial } from 'three'
import { Quaternion, Vector3 } from 'three'

import { quaternionEqualsEpsilon, vector3EqualsEpsilon } from '../../../../tests/util/MathTestUtils'
import { Engine } from '../../../ecs/classes/Engine'
import { getComponent } from '../../../ecs/functions/ComponentFunctions'
import { addComponent } from '../../../ecs/functions/ComponentFunctions'
import { createEntity } from '../../../ecs/functions/EntityFunctions'
import { createEngine } from '../../../initializeEngine'
import { Physics } from '../../../physics/classes/Physics'
import { RigidBodyComponent } from '../../../physics/components/RigidBodyComponent'
import { TransformComponent } from '../../../transform/components/TransformComponent'
import { Object3DComponent } from '../../components/Object3DComponent'
import { TriggerVolumeComponent } from '../../components/TriggerVolumeComponent'
import { deserializeTriggerVolume, serializeTriggerVolume, updateTriggerVolume } from './TriggerVolumeFunctions'

describe('TriggerVolumeFunctions', () => {
  beforeEach(async () => {
    createEngine()
    await Physics.load()
    Engine.instance.currentWorld.physicsWorld = Physics.createWorld()
  })

  const sceneComponentData = {
    onEnter: 'enter',
    onExit: 'exit',
    target: 'target'
  }

  describe('deserializeTriggerVolume()', () => {
    it('creates TriggerVolume Component with provided component data', () => {
      const entity = createEntity()
      addComponent(entity, TransformComponent, {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3(1.5, 2.5, 6)
      })
      deserializeTriggerVolume(entity, sceneComponentData)

      const triggervolumeComponent = getComponent(entity, TriggerVolumeComponent)
      assert.deepEqual(triggervolumeComponent, { ...sceneComponentData, active: true })

      const obj3d = getComponent(entity, Object3DComponent)?.value as Mesh<any, MeshBasicMaterial>
      assert(obj3d && obj3d.material.visible === false, 'TriggerVolume outline is not disabled')
    })
  })

  describe('updateTriggerVolume()', () => {
    it('should not update collider body', () => {
      const entity = createEntity()
      const transform = addComponent(entity, TransformComponent, {
        position: new Vector3(1, 2, 3),
        rotation: new Quaternion(),
        scale: new Vector3(1, 2.2, 9)
      })

      Engine.instance.isEditor = true
      deserializeTriggerVolume(entity, sceneComponentData)
      updateTriggerVolume(entity)

      const body = getComponent(entity, RigidBodyComponent).body
      assert(vector3EqualsEpsilon(body.translation() as Vector3, transform.position))
      assert(quaternionEqualsEpsilon(body.rotation() as Quaternion, transform.rotation))
    })
  })

  describe('serializeTriggerVolume()', () => {
    it('should properly serialize triggervolume', () => {
      const entity = createEntity()
      addComponent(entity, TransformComponent, {
        position: new Vector3(),
        rotation: new Quaternion(),
        scale: new Vector3(1.5, 2.5, 6)
      })
      deserializeTriggerVolume(entity, sceneComponentData)
      assert.deepEqual(serializeTriggerVolume(entity), sceneComponentData)
    })

    it('should return undefine if there is no triggervolume component', () => {
      const entity = createEntity()
      assert(serializeTriggerVolume(entity) === undefined)
    })
  })
})

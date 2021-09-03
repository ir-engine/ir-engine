import { PipelineType, World } from '@xrengine/engine/src/ecs/classes/World'
import { Object3D, Quaternion, Vector3 } from 'three'
import { addComponent, createEntity, getComponent } from '../../src/ecs/functions/EntityFunctions'
// import { createMapObjects as createMapObjectsMock } from '../../src/map'
import { Entity } from '../../src/ecs/classes/Entity'
import { computeHip } from '../../src/ikrig/functions/IKFunctions'
import { IKObj } from '../../src/ikrig/components/IKObj'
import { IKPose } from '../../src/ikrig/components/IKPose'
import { IKRig } from '../../src/ikrig/components/IKRig'
import { adoptBones, getTestIKPoseData, getTestIKRigData, setupTestSourceEntity } from './test-data/functions'
import { bones } from './test-data/pose1/ikrig.pose.bones'

// jest.mock('../../src/map', () => {
//   return {
//     createMapObjects: jest.fn(() => {
//       return {
//         mapMesh: new Object3D(),
//         navMesh: new Object3D(),
//         groundMesh: new Object3D()
//       }
//     })
//   }
// })

describe('check Compute', () => {
  let world: World, sourceEntity: Entity

  beforeEach(async () => {
    world = new World()
    sourceEntity = createEntity(world.ecsWorld)
    setupTestSourceEntity(sourceEntity, world)
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    //
  })

  it('correct test pose', async () => {
    const bonesStates = adoptBones(bones)
    const ikPose = getComponent(sourceEntity, IKPose)
    const rig = getComponent(sourceEntity, IKRig)
    rig.pose.bones.forEach((boneState) => {
      const expectedState = bonesStates.find((bs) => bs.name === boneState.name)
      console.log('--name', boneState.name)
      expect(boneState.length).toBeCloseTo(expectedState.length, 5)
      expect(boneState.bone.position.x).toBe(expectedState.bone.position.x)
    })
  })
  it('computeHip', async () => {
    const expectedHip = {
      bind_height: 0.9967209696769714,
      movement: new Vector3(1.6543612251060553e-24, -0.9967209696769714, 0.005501017905771732),
      dir: new Vector3(-0.03825399652123451, -0.12279260903596878, 0.9916948676109314),
      twist: -0.021266008978177296
    }
    const ikPose = getComponent(sourceEntity, IKPose)
    const rig = getComponent(sourceEntity, IKRig)

    computeHip(rig, ikPose)

    expect(ikPose.hip.bind_height).toBeCloseTo(expectedHip.bind_height)
    //expect(ikPose.hip).toMatchObject(expectedHip)
  })
})

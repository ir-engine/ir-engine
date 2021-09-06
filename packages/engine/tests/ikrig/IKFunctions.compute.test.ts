import { PipelineType, World } from '@xrengine/engine/src/ecs/classes/World'
import { Object3D, Quaternion, Vector3 } from 'three'
import { addComponent, createEntity, getComponent } from '../../src/ecs/functions/EntityFunctions'
// import { createMapObjects as createMapObjectsMock } from '../../src/map'
import { Entity } from '../../src/ecs/classes/Entity'
import { computeHip } from '../../src/ikrig/functions/IKFunctions'
import { IKObj } from '../../src/ikrig/components/IKObj'
import { IKPose } from '../../src/ikrig/components/IKPose'
import { IKRig } from '../../src/ikrig/components/IKRig'
import {
  adoptBones,
  applyPoseState,
  getTestIKPoseData,
  getTestIKRigData,
  setupTestSourceEntity
} from './test-data/functions'
import { bones } from './test-data/pose1/ikrig.pose.bones'
import { bones as tbones } from './test-data/ikrig.tpose.bones'

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

  test('correct test pose', async () => {
    const animBonesStates = adoptBones(bones)
    const tbonesStates = adoptBones(tbones)
    const ikPose = getComponent(sourceEntity, IKPose)
    const rig = getComponent(sourceEntity, IKRig)
    const boneWorldPosition = new Vector3()
    const boneWorldRotation = new Quaternion()

    applyPoseState(rig.pose, animBonesStates)

    rig.tpose.bones.forEach((boneState) => {
      const expectedState = tbonesStates.find((bs) => bs.name === boneState.name)
      console.log('-- Tpose bone -- name:', boneState.name)
      expect(boneState.length).toBeCloseTo(expectedState.length, 4)
      expect(boneState.bone.position.x).toBe(expectedState.local.position.x)
      expect(boneState.bone.position.y).toBe(expectedState.local.position.y)
      expect(boneState.bone.position.z).toBe(expectedState.local.position.z)
      boneState.bone.getWorldPosition(boneWorldPosition)
      boneState.bone.getWorldQuaternion(boneWorldRotation)
      expect(boneWorldPosition).toBeCloseToVector(expectedState.world.position, 4)
      expect(boneWorldRotation).toBeCloseToQuaternion(expectedState.world.quaternion, 2)
    })

    rig.pose.bones.forEach((boneState) => {
      const expectedState = animBonesStates.find((bs) => bs.name === boneState.name)
      console.log('-- pose bone -- name:', boneState.name)
      expect(boneState.length).toBeCloseTo(expectedState.length, 4)
      expect(boneState.bone.position.x).toBe(expectedState.local.position.x)
      expect(boneState.bone.position.y).toBe(expectedState.local.position.y)
      expect(boneState.bone.position.z).toBe(expectedState.local.position.z)
      boneState.bone.getWorldPosition(boneWorldPosition)
      boneState.bone.getWorldQuaternion(boneWorldRotation)
      expect(boneWorldPosition).toBeCloseToVector(expectedState.world.position, 4)
      expect(boneWorldRotation).toBeCloseToQuaternion(expectedState.world.quaternion, 2)
    })
  })
  it('computeHip', async () => {
    const expectedHip = {
      bind_height: 0.9967209696769714,
      movement: new Vector3(-0.004672907337646266, -0.07793418862592905, 0.005501017976132043),
      dir: new Vector3(-0.03825378847947507, -0.1227924413107874, 0.9916948442055679),
      twist: -0.021265088007216708
    }

    const expectedMidVars = {
      bindBoneWorldQuaternion: new Quaternion(
        -0.06047876164010382,
        1.2979864261117819e-8,
        4.4180032320538633e-7,
        0.9981694843012805
      ),
      poseBoneWorldQuaternion: new Quaternion(
        0.0012394188587760814,
        -0.01797843990675236,
        -0.010550386242235647,
        0.9997819406698403
      ),
      poseBoneWorldPosition: new Vector3(-0.004672907337646266, 0.9187867810510424, 0.005501061544186096),
      posePosition: new Vector3(-0.004672907337646266, 0.9187867810510424, 0.005501061544186096),
      bindPosition: new Vector3(-1.6543612251060553e-24, 0.9967209696769714, 4.356805405336672e-8),
      vec3Dot: 0.021263485350591943,
      twist: -0.021265088007216708
    }

    const ikPose = getComponent(sourceEntity, IKPose)
    const rig = getComponent(sourceEntity, IKRig)

    const animBonesStates = adoptBones(bones)
    applyPoseState(rig.pose, animBonesStates)

    let {
      bindBoneWorldQuaternion,
      poseBoneWorldQuaternion,
      poseBoneWorldPosition,
      posePosition,
      bindPosition,
      vec3Dot,
      twist
    } = computeHip(rig, ikPose)

    // const r = 0,
    //   e = 0.2,
    //   t = 1
    // // expect(r).toBeCloseTo(e, t)
    // expect(new Vector3(0, 0, r)).toBeCloseToVector(new Vector3(0, 0, e), t)

    expect(posePosition).toBeCloseToVector(expectedMidVars.posePosition)
    expect(poseBoneWorldQuaternion).toBeCloseToQuaternion(expectedMidVars.poseBoneWorldQuaternion)
    expect(poseBoneWorldPosition).toBeCloseToVector(expectedMidVars.poseBoneWorldPosition)
    expect(bindPosition).toBeCloseToVector(expectedMidVars.bindPosition)
    expect(bindBoneWorldQuaternion).toBeCloseToQuaternion(expectedMidVars.bindBoneWorldQuaternion)
    expect(vec3Dot).toBeCloseTo(expectedMidVars.vec3Dot)
    expect(twist).toBeCloseTo(expectedMidVars.twist)

    expect(ikPose.hip.bind_height).toBeCloseTo(expectedHip.bind_height)
    expect(ikPose.hip.twist).toBeCloseTo(expectedHip.twist)
    expect(ikPose.hip.dir).toBeCloseToVector(expectedHip.dir)
    expect(ikPose.hip.movement).toBeCloseToVector(expectedHip.movement)
  })
})

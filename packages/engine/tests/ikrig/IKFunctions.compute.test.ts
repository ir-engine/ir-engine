import { PipelineType, World } from '@xrengine/engine/src/ecs/classes/World'
import { Object3D, Quaternion, Vector3 } from 'three'
import { addComponent, createEntity, getComponent } from '../../src/ecs/functions/EntityFunctions'
// import { createMapObjects as createMapObjectsMock } from '../../src/map'
import { Entity } from '../../src/ecs/classes/Entity'
import { computeHip, computeLimb, computeLookTwist, computeSpine } from '../../src/ikrig/functions/IKFunctions'
import { IKObj } from '../../src/ikrig/components/IKObj'
import {
  IKPose,
  IKPoseComponentType,
  IKPoseLimbData,
  IKPoseLookTwist,
  IKPoseSpineData
} from '../../src/ikrig/components/IKPose'
import { IKRig } from '../../src/ikrig/components/IKRig'
import {
  adoptBones,
  adoptIKPose,
  applyPoseState,
  getTestIKPoseData,
  getTestIKRigData,
  setupTestSourceEntity
} from './test-data/functions'
import { bones } from './test-data/pose1/ikrig.pose.bones'
import { bones as tbones } from './test-data/ikrig.tpose.bones'
import { ikpose as ikposeData } from './test-data/pose1/ikpose.computed'
import { BACK, DOWN, UP, FORWARD, LEFT, RIGHT } from '@xrengine/engine/src/ikrig/constants/Vector3Constants'

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
  let world: World, sourceEntity: Entity, expectedIKPose
  beforeAll(() => {
    world = new World()
  })

  beforeEach(async () => {
    sourceEntity = createEntity(world.ecsWorld)
    setupTestSourceEntity(sourceEntity, world)
    const rig = getComponent(sourceEntity, IKRig)
    // apply animation pose
    const animBonesStates = adoptBones(bones)
    applyPoseState(rig.pose, animBonesStates)

    // setup expected animation pose data
    expectedIKPose = adoptIKPose(ikposeData)
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
  it('computeHip', () => {
    const expectedHip = expectedIKPose.hip
    const ikPose = getComponent(sourceEntity, IKPose)
    const rig = getComponent(sourceEntity, IKRig)

    computeHip(rig, ikPose)

    expect(ikPose.hip.bind_height).toBeCloseTo(expectedHip.bind_height)
    expect(ikPose.hip.twist).toBeCloseTo(expectedHip.twist)
    expect(ikPose.hip.dir).toBeCloseToVector(expectedHip.dir)
    expect(ikPose.hip.movement).toBeCloseToVector(expectedHip.movement)
  })

  test.each(['leg_l', 'leg_r', 'arm_l', 'arm_r'])('compute limb %s', (limb) => {
    const expected: IKPoseLimbData = expectedIKPose[limb]

    const ikPose = getComponent(sourceEntity, IKPose) as IKPoseComponentType
    const rig = getComponent(sourceEntity, IKRig)

    computeLimb(rig.pose, rig.chains[limb], ikPose[limb])

    const computed: IKPoseLimbData = ikPose[limb]

    expect(computed.dir).toBeCloseToVector(expected.dir, 4)
    expect(computed.jointDirection).toBeCloseToVector(expected.jointDirection, 4)
    expect(computed.lengthScale).toBeCloseTo(expected.lengthScale)
  })

  test.each(['foot_l', 'foot_r', 'head'])('compute look/twist for %s', (chainName) => {
    const expected: IKPoseLookTwist = expectedIKPose[chainName]

    const ikPose = getComponent(sourceEntity, IKPose) as IKPoseComponentType
    const rig = getComponent(sourceEntity, IKRig)

    computeLookTwist(rig, rig.points[chainName], ikPose[chainName], FORWARD, UP)

    const computed: IKPoseLookTwist = ikPose[chainName]

    expect(computed.lookDirection).toBeCloseToVector(expected.lookDirection, 4)
    expect(computed.twistDirection).toBeCloseToVector(expected.twistDirection, 4)
  })

  test('compute spine', () => {
    const expected: IKPoseSpineData = expectedIKPose.spine

    const ikPose = getComponent(sourceEntity, IKPose) as IKPoseComponentType
    const rig = getComponent(sourceEntity, IKRig)

    computeSpine(rig, rig.chains.spine, ikPose, UP, FORWARD)

    const computed: IKPoseSpineData = ikPose.spine

    expect(computed[0].lookDirection).toBeCloseToVector(expected[0].lookDirection, 4)
    expect(computed[0].twistDirection).toBeCloseToVector(expected[0].twistDirection, 4)

    expect(computed[1].lookDirection).toBeCloseToVector(expected[1].lookDirection, 4)
    expect(computed[1].twistDirection).toBeCloseToVector(expected[1].twistDirection, 4)
  })
})

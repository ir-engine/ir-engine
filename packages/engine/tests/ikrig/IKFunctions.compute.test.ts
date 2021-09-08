import { PipelineType, World } from '@xrengine/engine/src/ecs/classes/World'
import { Object3D, Quaternion, Vector3 } from 'three'
import { addComponent, createEntity, getComponent } from '../../src/ecs/functions/EntityFunctions'
// import { createMapObjects as createMapObjectsMock } from '../../src/map'
import { Entity } from '../../src/ecs/classes/Entity'
import {
  applyHip,
  applyLimb,
  applyLimbTmp,
  applyLookTwist,
  applySpine,
  computeHip,
  computeIKPose,
  computeLimb,
  computeLookTwist,
  computeSpine
} from '../../src/ikrig/functions/IKFunctions'
import { IKObj } from '../../src/ikrig/components/IKObj'
import {
  IKPose,
  IKPoseComponentType,
  IKPoseLimbData,
  IKPoseLookTwist,
  IKPoseSpineData
} from '../../src/ikrig/components/IKPose'
import { IKRig, IKRigComponentType } from '../../src/ikrig/components/IKRig'
import {
  adoptBones,
  adoptIKPose,
  applyTestPoseState,
  setupTestSourceEntity,
  setupTestTargetEntity
} from './test-data/functions'
import { bones } from './test-data/pose1/ikrig.pose.bones'
import { bones as tbones } from './test-data/ikrig.tpose.bones'
import { bones as poseBonesForLimbs } from './test-data/rig2.pose.bones'
import { ikpose as ikposeData } from './test-data/pose1/ikpose.computed'
import { rigData as rigDataApplied } from './test-data/rig2.data.applied'
import { BACK, DOWN, UP, FORWARD, LEFT, RIGHT } from '@xrengine/engine/src/ikrig/constants/Vector3Constants'
import { PoseBoneLocalState } from '../../src/ikrig/classes/Pose'
import { solveLimb } from '../../src/ikrig/functions/IKSolvers'

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
let world: World, sourceEntity: Entity, expectedIKPose
beforeAll(() => {
  world = new World()
})
beforeEach(() => {
  jest.clearAllMocks()
})

describe('check Compute', () => {
  beforeEach(async () => {
    sourceEntity = createEntity(world.ecsWorld)
    setupTestSourceEntity(sourceEntity, world)
    const rig = getComponent(sourceEntity, IKRig)
    // apply animation pose
    const animBonesStates = adoptBones(bones)
    applyTestPoseState(rig.pose, animBonesStates)

    // setup expected animation pose data
    expectedIKPose = adoptIKPose(ikposeData)
  })

  afterEach(() => {
    //
  })

  test.skip('correct test pose', async () => {
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

describe('Check Apply', () => {
  let ikPose: IKPoseComponentType,
    targetEntity: Entity,
    targetRig: IKRigComponentType,
    expectedState: PoseBoneLocalState[]
  const boneWorldPosition = new Vector3()
  const boneWorldRotation = new Quaternion()

  function beforeEachTest() {}

  beforeAll(() => {
    expectedState = adoptBones(rigDataApplied.pose.bones)
  })

  beforeEach(() => {
    sourceEntity = createEntity(world.ecsWorld)
    setupTestSourceEntity(sourceEntity, world)
    const rig = getComponent(sourceEntity, IKRig)
    ikPose = getComponent(sourceEntity, IKPose)
    // apply animation pose
    const animBonesStates = adoptBones(bones)
    applyTestPoseState(rig.pose, animBonesStates)

    computeIKPose(rig, ikPose)

    // init target entity and rig
    targetEntity = createEntity(world.ecsWorld)
    setupTestTargetEntity(targetEntity, world)
    targetRig = getComponent(targetEntity, IKRig)

    // apply animation pose
    const targetAnimBonesStates = adoptBones(poseBonesForLimbs)
    applyTestPoseState(targetRig.pose, targetAnimBonesStates)
  })

  test('apply Hip', () => {
    applyHip(ikPose, targetRig)

    const appliedHip = targetRig.pose.bones[targetRig.points.hip.index]
    const expectedHip = expectedState[targetRig.points.hip.index]

    expect(appliedHip.bone.position).toBeCloseToVector(expectedHip.local.position, 4)
    expect(appliedHip.bone.quaternion).toBeCloseToQuaternion(expectedHip.local.quaternion, 2)

    appliedHip.bone.getWorldPosition(boneWorldPosition)
    appliedHip.bone.getWorldQuaternion(boneWorldRotation)
    expect(boneWorldPosition).toBeCloseToVector(expectedHip.world.position, 4)
    expect(boneWorldRotation).toBeCloseToQuaternion(expectedHip.world.quaternion, 2)
  })

  test('x apply limb leg_l', () => {
    const boneName = 'leg_l'
    const chain = targetRig.chains[boneName]
    const limb = ikPose[boneName]
    const expectedLimb = {
      dir: new Vector3(-0.09208551049232483, -0.6795139312744141, -0.7278606295585632),
      joint_dir: new Vector3(0.18084418773651123, -0.7302229404449463, 0.658839762210846),
      len_scale: 0.5933292853279439
    }
    expect(chain.length).toBeCloseTo(0.826984795406015)
    expect(limb.lengthScale).toBeCloseTo(expectedLimb.len_scale)
    expect(limb.dir).toBeCloseToVector(expectedLimb.dir, 4)
    expect(limb.jointDirection).toBeCloseToVector(expectedLimb.joint_dir, 4)

    const { preTargetVars, preGroundingVars, solveLimbVars } = applyLimb(ikPose, targetRig, chain, limb, 0)

    const expectedPreTargetVars = {
      len: 0.49067429763532683,
      p_tran: {
        pos: new Vector3(0, 0, 0.005501061677932739),
        rot: new Quaternion(0.0012618519831448793, -0.017835982143878937, -0.011710396967828274, 0.9997715353965759),
        scl: new Vector3(1, 1, 1)
      },
      c_tran: {
        pos: new Vector3(0.08992571383714676, -0.06811448186635971, -0.000022773630917072296),
        rot: new Quaternion(-0.997866153717041, 0.010610141791403294, -0.01851150207221508, 0.061707753688097),
        scl: new Vector3(1, 1, 0.9999760985374451)
      }
    }

    const expectedTarget = {
      axis: {
        x: new Vector3(0.9791913032531738, 0.07095976918935776, -0.1901291012763977),
        y: new Vector3(0.18084420263767242, -0.7302229404449463, 0.658839762210846),
        z: new Vector3(-0.09208551049232483, -0.6795139312744141, -0.7278606295585632)
      },
      end_pos: new Vector3(0.04474171996116638, -0.4015344977378845, -0.35716527700424194),
      len: 0.4906742993087348,
      len_sqr: 0.24076126800211786,
      start_pos: new Vector3(0.08992571383714676, -0.06811448186635971, -0.000022773630917072296)
    }

    expect(preTargetVars.c_tran.position).toBeCloseToVector(expectedPreTargetVars.c_tran.pos, 4)
    expect(preTargetVars.c_tran.quaternion).toBeCloseToQuaternion(expectedPreTargetVars.c_tran.rot, 2)
    expect(preTargetVars.c_tran.scale).toBeCloseToVector(expectedPreTargetVars.c_tran.scl, 4)
    expect(preTargetVars.p_tran.position).toBeCloseToVector(expectedPreTargetVars.p_tran.pos, 4)
    expect(preTargetVars.p_tran.quaternion).toBeCloseToQuaternion(expectedPreTargetVars.p_tran.rot, 2)
    expect(preTargetVars.p_tran.scale).toBeCloseToVector(expectedPreTargetVars.p_tran.scl, 4)

    expect(preTargetVars.len).toBeCloseTo(expectedPreTargetVars.len, 4)

    expect(preGroundingVars.target.start_pos).toBeCloseToVector(expectedTarget.start_pos, 4)
    expect(preGroundingVars.target.end_pos).toBeCloseToVector(expectedTarget.end_pos, 4)
    expect(preGroundingVars.target.len).toBeCloseTo(expectedTarget.len, 4)
    expect(preGroundingVars.target.len).toBeCloseTo(expectedTarget.len, 4)

    const expectedSolveLimbVars = {
      rotAfterAim: new Quaternion(-0.9107131958007812, 0.005796780344098806, 0.10183638334274292, 0.4002465009689331),
      acbLen: {
        aLen: 0.4059943074565367,
        bLen: 0.4209904879494783,
        cLen: 0.4906742993087348
      },
      firstRad: 0.9604389659008623
    }
    expect(solveLimbVars.acbLen.aLen).toBeCloseTo(expectedSolveLimbVars.acbLen.aLen)
    expect(solveLimbVars.acbLen.bLen).toBeCloseTo(expectedSolveLimbVars.acbLen.bLen)
    expect(solveLimbVars.acbLen.cLen).toBeCloseTo(expectedSolveLimbVars.acbLen.cLen)
    expect(solveLimbVars.firstRad).toBeCloseTo(expectedSolveLimbVars.firstRad)
    expect(solveLimbVars.rotAfterAim).toBeCloseToQuaternion(expectedSolveLimbVars.rotAfterAim, 3)

    const bone0 = targetRig.pose.bones[targetRig.chains[boneName].chainBones[0].index]
    const expectedBone0 = expectedState[targetRig.chains[boneName].chainBones[0].index]
    const bone1 = targetRig.pose.bones[targetRig.chains[boneName].chainBones[1].index]
    const expectedBone1 = expectedState[targetRig.chains[boneName].chainBones[1].index]
    expect(bone0.world.position).toBeCloseToVector(expectedBone0.world.position, 3)
    expect(bone0.world.quaternion).toBeCloseToQuaternion(expectedBone0.world.quaternion, 3)
    expect(bone1.world.position).toBeCloseToVector(expectedBone1.world.position, 3)
    expect(bone1.world.quaternion).toBeCloseToQuaternion(expectedBone1.world.quaternion, 3)

    targetRig.chains[boneName].chainBones.forEach((boneData) => {
      const subBoneName = boneData.ref.name
      console.log('bone ' + subBoneName)
      const applied = targetRig.pose.bones[boneData.index]
      const expected = expectedState[boneData.index]

      // const posediff = applied.bone.position.clone().sub(expected.local.position)
      // const anglediff = applied.bone.quaternion.angleTo(expected.local.quaternion)
      //
      // debugger
      expect(applied.local.position).toBeCloseToVector(expected.local.position, 4)
      expect(applied.local.quaternion).toBeCloseToQuaternion(expected.local.quaternion, 2)
      expect(applied.world.position).toBeCloseToVector(expected.world.position, 4)
      expect(applied.world.quaternion).toBeCloseToQuaternion(expected.world.quaternion, 2)
    })
  })
  test.each(['leg_l', 'leg_r', 'arm_l', 'arm_r'])('apply limb %s', (boneName) => {
    const chain = targetRig.chains[boneName]
    const limb = ikPose[boneName]
    // applyLimbTmp(ikPose, targetRig, targetRig, boneName, ikPose[boneName])
    applyLimb(ikPose, targetRig, chain, limb, 0)
    targetRig.chains[boneName].chainBones.forEach((boneData) => {
      const subBoneName = boneData.ref.name
      console.log('bone ' + subBoneName)
      const applied = targetRig.pose.bones[boneData.index]
      const expected = expectedState[boneData.index]

      expect(applied.bone.position).toBeCloseToVector(expected.local.position, 4)
      expect(applied.bone.quaternion).toBeCloseToQuaternion(expected.local.quaternion, 2)

      // applied.bone.getWorldPosition(boneWorldPosition)
      // applied.bone.getWorldQuaternion(boneWorldRotation)
      // expect(boneWorldPosition).toBeCloseToVector(expected.world.position, 4)
      // expect(boneWorldRotation).toBeCloseToQuaternion(expected.world.quaternion, 2)
    })
  })

  test.each(['foot_l', 'foot_r', 'head'])('apply look/twist %s', (boneName) => {
    applyLookTwist(targetRig, targetRig.points[boneName], ikPose[boneName], FORWARD, UP)

    const applied = targetRig.pose.bones[targetRig.points[boneName].index]
    const expected = expectedState[targetRig.points[boneName].index]

    expect(applied.bone.position).toBeCloseToVector(expected.local.position, 4)
    expect(applied.bone.quaternion).toBeCloseToQuaternion(expected.local.quaternion, 2)

    applied.bone.getWorldPosition(boneWorldPosition)
    applied.bone.getWorldQuaternion(boneWorldRotation)
    expect(boneWorldPosition).toBeCloseToVector(expected.world.position, 4)
    expect(boneWorldRotation).toBeCloseToQuaternion(expected.world.quaternion, 2)
  })

  test('apply spine', () => {
    // applySpine(ikPose, targetRig, targetRig.chains.spine, ikPose.spine, UP, FORWARD)
    // TODO: test chain bones transforms
    // const applied = targetRig.pose.bones[targetRig.points.spine.index]
    // const expected = expectedState[targetRig.points.spine.index]
    //
    // expect(applied.bone.position).toBeCloseToVector(expected.local.position, 4)
    // expect(applied.bone.quaternion).toBeCloseToQuaternion(expected.local.quaternion, 2)
    //
    // applied.bone.getWorldPosition(boneWorldPosition)
    // applied.bone.getWorldQuaternion(boneWorldRotation)
    // expect(boneWorldPosition).toBeCloseToVector(expected.world.position, 4)
    // expect(boneWorldRotation).toBeCloseToQuaternion(expected.world.quaternion, 2)
  })
  // Their apply_rig works with source IKPose and have just targetRig as argument
  /*
// APPLY
console.log('~~~ APPLY RIG', targetRig['name'])


applyLimbTmp(ikPose, rig, targetRig, 'leg_l', ikPose.leg_l)
applyLimbTmp(ikPose, rig, targetRig, 'leg_r', ikPose.leg_r)

applyLookTwist(targetRig, targetRig.points.foot_l, ikPose.foot_l, FORWARD, UP)
applyLookTwist(targetRig, targetRig.points.foot_r, ikPose.foot_r, FORWARD, UP)
applySpine(ikPose, targetRig, rig.chains.spine, ikPose.spine, UP, FORWARD)

applyLimbTmp(ikPose, rig, targetRig, 'arm_l', ikPose.arm_l)
applyLimbTmp(ikPose, rig, targetRig, 'arm_r', ikPose.arm_r)

applyLookTwist(targetRig, targetRig.points.head, ikPose.head, FORWARD, UP)
   */
})

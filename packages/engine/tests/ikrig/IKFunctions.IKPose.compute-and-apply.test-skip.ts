// import { World } from '@xrengine/engine/src/ecs/classes/World'
// import { Quaternion, Vector3 } from 'three'
// import { createEntity } from '../../src/ecs/functions/EntityFunctions'
// import { getComponent } from '../../src/ecs/functions/ComponentFunctions'
// import { Entity } from '../../src/ecs/classes/Entity'
// import {
//   applyHip,
//   applyIKPoseToIKRig,
//   applyLimb,
//   applyLookTwist,
//   applyPoseToRig,
//   applySpine,
//   computeHip,
//   computeIKPose,
//   computeLimb,
//   computeLookTwist,
//   computeSpine,
//   worldToModel
// } from '../../src/ikrig/functions/IKFunctions'
// import {
//   IKPoseComponent,
//   IKPoseComponentType,
//   IKPoseLimbData,
//   IKPoseLookTwist,
//   IKPoseSpineData
// } from '../../src/ikrig/components/IKPoseComponent'
// import { IKRigComponent, IKRigComponentType, IKRigTargetComponent } from '../../src/ikrig/components/IKRigComponent'
// import {
//   adoptBones,
//   adoptIKPose,
//   applyTestPoseState,
//   setupTestSourceEntity,
//   setupTestTargetEntity,
//   targetMeshTransform,
//   vector3FromSerialized
// } from './test-data/functions'
// import { bones } from './test-data/pose1/ikrig.pose.bones'
// import { bones as tbones } from './test-data/ikrig.tpose.bones'
// import { bones as poseBonesForLegs } from './test-data/rig2.pose.bones'
// import { bones as poseBonesWithAppliedHipLegsSpine } from './test-data/rig2.pose.bones-after-hip-legs-spine'
// import { ikpose as ikposeData } from './test-data/pose1/ikpose.computed'
// import { rigData as rigDataApplied } from './test-data/rig2.data.applied'
// import { FORWARD, UP } from '@xrengine/engine/src/ikrig/constants/Vector3Constants'
// import { PoseBoneLocalState } from '../../src/ikrig/classes/Pose'
// // import '../custom-matchers'
// import { createWorld } from '../../src/ecs/functions/EngineFunctions'
// import { useEngine } from '../../src/ecs/classes/Engine'

// let sourceEntity: Entity, expectedIKPose
// before(() => {
//   useEngine().currentWorld = createWorld()
// })

// describe('check Compute', () => {
//   beforeEach(async () => {
//     sourceEntity = createEntity()
//     setupTestSourceEntity(sourceEntity)
//     const rig = getComponent(sourceEntity, IKRigComponent)
//     // apply animation pose
//     const animBonesStates = adoptBones(bones)
//     applyTestPoseState(rig.pose, animBonesStates)

//     // setup expected animation pose data
//     expectedIKPose = adoptIKPose(ikposeData)
//   })

//   after(() => {
//     //
//   })

//   test('correct test pose', async () => {
//     const animBonesStates = adoptBones(bones)
//     const tbonesStates = adoptBones(tbones)
//     const rig = getComponent(sourceEntity, IKRigComponent)

//     expect(rig.tpose.bones[0].world.position).toBeCloseToVector(tbonesStates[0].world.position)
//     expect(rig.tpose.bones[0].world.scale).toBeCloseToVector(tbonesStates[0].world.scale)
//     expect(rig.tpose.bones[0].world.quaternion).toBeCloseToQuaternion(tbonesStates[0].world.quaternion, 2)

//     rig.tpose.bones.forEach((boneState) => {
//       const expectedState = tbonesStates.find((bs) => bs.name === boneState.name)
//       console.log('-- Tpose bone -- name:', boneState.name)
//       expect(boneState.length).toBeCloseTo(expectedState.length, 4)
//       expect(boneState.bone.position.x).toBe(expectedState.local.position.x)
//       expect(boneState.bone.position.y).toBe(expectedState.local.position.y)
//       expect(boneState.bone.position.z).toBe(expectedState.local.position.z)
//       // boneState.bone.getWorldPosition(boneWorldPosition)
//       // boneState.bone.getWorldQuaternion(boneWorldRotation)
//       expect(boneState.world.position).toBeCloseToVector(expectedState.world.position, 4)
//       expect(boneState.world.quaternion).toBeCloseToQuaternion(expectedState.world.quaternion, 2)
//       expect(boneState.world.scale).toBeCloseToVector(expectedState.world.scale, 4)
//     })

//     rig.pose.bones.forEach((boneState) => {
//       const expectedState = animBonesStates.find((bs) => bs.name === boneState.name)
//       console.log('-- pose bone -- name:', boneState.name)
//       expect(boneState.length).toBeCloseTo(expectedState.length, 4)
//       expect(boneState.bone.position).toBeCloseToVector(expectedState.local.position)
//       expect(boneState.bone.quaternion).toBeCloseToQuaternion(expectedState.local.quaternion, 2)
//       expect(boneState.bone.scale).toBeCloseToVector(expectedState.local.scale)

//       expect(boneState.world.position).toBeCloseToVector(expectedState.world.position)
//       expect(boneState.world.quaternion).toBeCloseToQuaternion(expectedState.world.quaternion, 2)
//       expect(boneState.world.scale).toBeCloseToVector(expectedState.world.scale)
//     })
//   })

//   test('correct chains', async () => {
//     const rig = getComponent(sourceEntity, IKRigComponent)

//     for (let chainsKey in rigDataApplied.chains) {
//       const chain = rig.chains[chainsKey]
//       const expectedChain = rigDataApplied.chains[chainsKey]
//       expect(chain.cnt).toBe(expectedChain.cnt)
//       expect(chain.end_idx).toBe(expectedChain.end_idx)
//       expect(chain.length).toBeCloseTo(expectedChain.len)
//       expect(chain.chainBones.length).toBe(expectedChain.bones.length)
//       expect(chain.altForward).toBeCloseToVector(vector3FromSerialized(expectedChain.alt_fwd))
//       expect(chain.altUp).toBeCloseToVector(vector3FromSerialized(expectedChain.alt_up))
//       for (let i = 0; i < chain.chainBones.length; i++) {
//         expect(chain.chainBones[i].index).toBe(expectedChain.bones[i].idx)
//         expect(chain.chainBones[i].length).toBeCloseTo(expectedChain.bones[i].len)
//       }
//     }
//   })

//   it('computeHip', () => {
//     const expectedHip = expectedIKPose.hip
//     const ikPose = getComponent(sourceEntity, IKPoseComponent)
//     const rig = getComponent(sourceEntity, IKRigComponent)

//     computeHip(rig, ikPose)

//     expect(ikPose.hip.bind_height).toBeCloseTo(expectedHip.bind_height)
//     expect(ikPose.hip.twist).toBeCloseTo(expectedHip.twist)
//     expect(ikPose.hip.dir).toBeCloseToVector(expectedHip.dir)
//     expect(ikPose.hip.movement).toBeCloseToVector(expectedHip.movement)
//   })

//   test.each(['leg_l', 'leg_r', 'arm_l', 'arm_r'])('compute limb %s', (limb) => {
//     const expected: IKPoseLimbData = expectedIKPose[limb]

//     const ikPose = getComponent(sourceEntity, IKPoseComponent) as IKPoseComponentType
//     const rig = getComponent(sourceEntity, IKRigComponent)

//     computeLimb(rig.pose, rig.chains[limb], ikPose[limb])

//     const computed: IKPoseLimbData = ikPose[limb]

//     expect(computed.dir).toBeCloseToVector(expected.dir, 4)
//     expect(computed.jointDirection).toBeCloseToVector(expected.jointDirection, 4)
//     expect(computed.lengthScale).toBeCloseTo(expected.lengthScale)
//   })

//   test.each(['foot_l', 'foot_r', 'head'])('compute look/twist for %s', (chainName) => {
//     const expected: IKPoseLookTwist = expectedIKPose[chainName]

//     const ikPose = getComponent(sourceEntity, IKPoseComponent) as IKPoseComponentType
//     const rig = getComponent(sourceEntity, IKRigComponent)

//     computeLookTwist(rig, rig.points[chainName], ikPose[chainName], FORWARD, UP)

//     const computed: IKPoseLookTwist = ikPose[chainName]

//     expect(computed.lookDirection).toBeCloseToVector(expected.lookDirection, 4)
//     expect(computed.twistDirection).toBeCloseToVector(expected.twistDirection, 4)
//   })

//   test('compute spine', () => {
//     const expected: IKPoseSpineData = expectedIKPose.spine

//     const ikPose = getComponent(sourceEntity, IKPoseComponent) as IKPoseComponentType
//     const rig = getComponent(sourceEntity, IKRigComponent)

//     computeSpine(rig, rig.chains.spine, ikPose, UP, FORWARD)

//     const computed: IKPoseSpineData = ikPose.spine

//     expect(computed[0].lookDirection).toBeCloseToVector(expected[0].lookDirection, 4)
//     expect(computed[0].twistDirection).toBeCloseToVector(expected[0].twistDirection, 4)

//     expect(computed[1].lookDirection).toBeCloseToVector(expected[1].lookDirection, 4)
//     expect(computed[1].twistDirection).toBeCloseToVector(expected[1].twistDirection, 4)
//   })
// })

// describe('Check Apply', () => {
//   let ikPose: IKPoseComponentType,
//     targetEntity: Entity,
//     targetRig: IKRigComponentType,
//     expectedState: PoseBoneLocalState[]
//   const boneWorldPosition = new Vector3()
//   const boneWorldScale = new Vector3()
//   const boneWorldRotation = new Quaternion()

//   beforeAll(() => {
//     expectedState = adoptBones(rigDataApplied.pose.bones)
//   })

//   beforeEach(() => {
//     sourceEntity = createEntity()
//     setupTestSourceEntity(sourceEntity)
//     const rig = getComponent(sourceEntity, IKRigComponent)
//     ikPose = getComponent(sourceEntity, IKPoseComponent)
//     // apply animation pose
//     const animBonesStates = adoptBones(bones)
//     applyTestPoseState(rig.pose, animBonesStates)

//     computeIKPose(rig, ikPose)

//     // init target entity and rig
//     targetEntity = createEntity()
//     setupTestTargetEntity(targetEntity)
//     targetRig = getComponent(targetEntity, IKRigTargetComponent)

//     // apply animation pose
//     const targetAnimBonesStates = adoptBones(poseBonesForLegs)
//     applyTestPoseState(targetRig.pose, targetAnimBonesStates)
//   })

//   test('apply Hip', () => {
//     applyHip(ikPose, targetRig)

//     const appliedHip = targetRig.pose.bones[targetRig.points.hip.index]
//     const expectedHip = expectedState[targetRig.points.hip.index]

//     expect(appliedHip.local.position).toBeCloseToVector(expectedHip.local.position, 4)
//     expect(appliedHip.local.quaternion).toBeCloseToQuaternion(expectedHip.local.quaternion, 2)

//     expect(appliedHip.bone.position).toBeCloseToVector(expectedHip.local.position, 4)
//     expect(appliedHip.bone.quaternion).toBeCloseToQuaternion(expectedHip.local.quaternion, 2)

//     // expect(appliedHip.model.position).toBeCloseToVector(expectedHip.world.position, 4)
//     // expect(appliedHip.model.quaternion).toBeCloseToQuaternion(expectedHip.world.quaternion, 2)

//     appliedHip.bone.getWorldPosition(boneWorldPosition)
//     appliedHip.bone.getWorldQuaternion(boneWorldRotation)
//     appliedHip.bone.getWorldScale(boneWorldScale)
//     worldToModel(boneWorldPosition, boneWorldRotation, boneWorldScale, targetMeshTransform)

//     expect(boneWorldPosition).toBeCloseToVector(expectedHip.world.position, 4)
//     expect(boneWorldRotation).toBeCloseToQuaternion(expectedHip.world.quaternion, 2)
//   })

//   test('apply spine', () => {
//     applyHip(ikPose, targetRig)

//     const appliedHip = targetRig.pose.bones[targetRig.points.hip.index]
//     const expectedHip = expectedState[targetRig.points.hip.index]

//     expect(appliedHip.local.position).toBeCloseToVector(expectedHip.local.position, 4)
//     expect(appliedHip.local.quaternion).toBeCloseToQuaternion(expectedHip.local.quaternion, 2)

//     expect(appliedHip.bone.position).toBeCloseToVector(expectedHip.local.position, 4)
//     expect(appliedHip.bone.quaternion).toBeCloseToQuaternion(expectedHip.local.quaternion, 2)

//     expect(appliedHip.world.position).toBeCloseToVector(expectedHip.world.position, 4)
//     expect(appliedHip.world.quaternion).toBeCloseToQuaternion(expectedHip.world.quaternion, 2)

//     applySpine(ikPose, targetRig, targetRig.chains.spine, ikPose.spine, UP, FORWARD)

//     const chain = targetRig.chains.spine
//     const firstBone = targetRig.pose.bones[chain.first()]
//     const expectedFirstBone = expectedState[chain.first()]
//     expect(firstBone.local.position).toBeCloseToVector(expectedFirstBone.local.position, 4)
//     expect(firstBone.local.quaternion).toBeCloseToQuaternion(expectedFirstBone.local.quaternion, 2)

//     const lastBone = targetRig.pose.bones[chain.last()]
//     const expectedLastBone = expectedState[chain.last()]
//     expect(lastBone.local.position).toBeCloseToVector(expectedLastBone.local.position, 4)
//     expect(lastBone.local.quaternion).toBeCloseToQuaternion(expectedLastBone.local.quaternion, 2)

//     // now test all bones of chain
//     targetRig.chains.spine.chainBones.forEach((boneData) => {
//       const subBoneName = boneData.ref.name
//       console.log('bone ' + subBoneName)
//       const applied = targetRig.pose.bones[boneData.index]
//       const expected = expectedState[boneData.index]

//       expect(applied.local.position).toBeCloseToVector(expected.local.position, 4)
//       expect(applied.local.quaternion).toBeCloseToQuaternion(expected.local.quaternion, 2)
//       // applied.bone.getWorldPosition(boneWorldPosition)
//       // applied.bone.getWorldQuaternion(boneWorldRotation)
//       // applied.bone.getWorldScale(boneWorldScale)
//       // worldToModel(boneWorldPosition, boneWorldRotation, boneWorldScale, targetRig.pose.rootOffset)
//       //
//       // expect(boneWorldPosition).toBeCloseToVector(expected.world.position, 4)
//       // expect(boneWorldScale).toBeCloseToVector(expected.world.scale, 4)
//       // expect(boneWorldRotation).toBeCloseToQuaternion(expected.world.quaternion, 2)
//     })
//   })

//   const expectedMidVarsLimbs = {
//     leg_l: {
//       chainLength: 0.826984795406015,
//       limb: {
//         dir: new Vector3(-0.09208551049232483, -0.6795139312744141, -0.7278606295585632),
//         joint_dir: new Vector3(0.18084418773651123, -0.7302229404449463, 0.658839762210846),
//         len_scale: 0.5933292853279439
//       },
//       preTargetVars: {
//         len: 0.49067429763532683,
//         p_tran: {
//           pos: new Vector3(0, 0, 0.005501061677932739),
//           rot: new Quaternion(0.0012618519831448793, -0.017835982143878937, -0.011710396967828274, 0.9997715353965759),
//           scl: new Vector3(1, 1, 1)
//         },
//         c_tran: {
//           pos: new Vector3(0.08992571383714676, -0.06811448186635971, -0.000022773630917072296),
//           rot: new Quaternion(-0.997866153717041, 0.010610141791403294, -0.01851150207221508, 0.061707753688097),
//           scl: new Vector3(1, 1, 0.9999760985374451)
//         }
//       },
//       target: {
//         axis: {
//           x: new Vector3(0.9791913032531738, 0.07095976918935776, -0.1901291012763977),
//           y: new Vector3(0.18084420263767242, -0.7302229404449463, 0.658839762210846),
//           z: new Vector3(-0.09208551049232483, -0.6795139312744141, -0.7278606295585632)
//         },
//         end_pos: new Vector3(0.04474171996116638, -0.4015344977378845, -0.35716527700424194),
//         len: 0.4906742993087348,
//         len_sqr: 0.24076126800211786,
//         start_pos: new Vector3(0.08992571383714676, -0.06811448186635971, -0.000022773630917072296)
//       },
//       solveLimbVars: {
//         rotAfterAim: new Quaternion(-0.9107131958007812, 0.005796780344098806, 0.10183638334274292, 0.4002465009689331),
//         acbLen: {
//           aLen: 0.4059943074565367,
//           bLen: 0.4209904879494783,
//           cLen: 0.4906742993087348
//         },
//         firstRad: 0.9604389659008623
//       }
//     },
//     arm_l: {
//       chainLength: 0.5501921921968485,
//       limb: {
//         dir: new Vector3(-0.23155513405799866, -0.8478862047195435, 0.47693946957588196),
//         joint_dir: new Vector3(0.7634854912757874, -0.46222051978111267, -0.45104557275772095),
//         len_scale: 0.522264668173491
//       },

//       preTargetVars: {
//         len: 0.28734594268933267,
//         p_tran: {
//           pos: new Vector3(0.03283514827489853, 0.4228754937648773, 0.1231885626912117),
//           rot: new Quaternion(0.6655179858207703, 0.6771541237831116, 0.3124212920665741, 0.030681125819683075),
//           scl: new Vector3(1, 1, 1)
//         },
//         c_tran: {
//           pos: new Vector3(0.1566656529903412, 0.420114666223526, 0.1600237786769867),
//           rot: new Quaternion(0.6655179262161255, 0.6771541833877563, 0.3124212920665741, 0.030681084841489792),
//           scl: new Vector3(1, 1, 1)
//         }
//       },
//       target: {
//         axis: {
//           x: new Vector3(-0.6028864979743958, -0.2596944272518158, -0.7543783187866211),
//           y: new Vector3(0.7634854912757874, -0.46222054958343506, -0.45104557275772095),
//           z: new Vector3(-0.23155513405799866, -0.8478862047195435, 0.47693946957588196)
//         },
//         end_pos: new Vector3(0.09012922644615173, 0.17647799849510193, 0.29707038402557373),
//         len: 0.2873459482168701,
//         len_sqr: 0.0825676939566522,
//         start_pos: new Vector3(0.1566656529903412, 0.420114666223526, 0.1600237786769867)
//       },
//       solveLimbVars: {
//         rotAfterAim: new Quaternion(0.8517362475395203, 0.00825949851423502, 0.4455207884311676, 0.2756604552268982),
//         acbLen: {
//           aLen: 0.27404703199863434,
//           bLen: 0.27614516019821417,
//           cLen: 0.2873459482168701
//         },
//         firstRad: 1.027530667791543
//       }
//     }
//   }

//   // test.each(['leg_l', 'arm_l'])('x apply limb %s', (boneName) => {
//   //   const chain = targetRig.chains[boneName]
//   //   const limb = ikPose[boneName]
//   //   const expectedMidVars = expectedMidVarsLimbs[boneName]
//   //   const expectedLimb = expectedMidVars.limb
//   //   expect(chain.length).toBeCloseTo(expectedMidVars.chainLength)
//   //   expect(limb.lengthScale).toBeCloseTo(expectedLimb.len_scale)
//   //   expect(limb.dir).toBeCloseToVector(expectedLimb.dir, 4)
//   //   expect(limb.jointDirection).toBeCloseToVector(expectedLimb.joint_dir, 4)
//   //
//   //   const { preTargetVars, preGroundingVars, solveLimbVars } = applyLimb(ikPose, targetRig, chain, limb, 0)
//   //
//   //   const expectedPreTargetVars = expectedMidVars.preTargetVars
//   //
//   //   const expectedTarget = expectedMidVars.target
//   //
//   //   expect(preTargetVars.c_tran.position).toBeCloseToVector(expectedPreTargetVars.c_tran.pos, 4)
//   //   expect(preTargetVars.c_tran.quaternion).toBeCloseToQuaternion(expectedPreTargetVars.c_tran.rot, 2)
//   //   expect(preTargetVars.c_tran.scale).toBeCloseToVector(expectedPreTargetVars.c_tran.scl, 4)
//   //   expect(preTargetVars.p_tran.position).toBeCloseToVector(expectedPreTargetVars.p_tran.pos, 4)
//   //   expect(preTargetVars.p_tran.quaternion).toBeCloseToQuaternion(expectedPreTargetVars.p_tran.rot, 2)
//   //   expect(preTargetVars.p_tran.scale).toBeCloseToVector(expectedPreTargetVars.p_tran.scl, 4)
//   //
//   //   expect(preTargetVars.len).toBeCloseTo(expectedPreTargetVars.len, 4)
//   //
//   //   expect(preGroundingVars.target.start_pos).toBeCloseToVector(expectedTarget.start_pos, 4)
//   //   expect(preGroundingVars.target.end_pos).toBeCloseToVector(expectedTarget.end_pos, 4)
//   //   expect(preGroundingVars.target.len).toBeCloseTo(expectedTarget.len, 4)
//   //   expect(preGroundingVars.target.len).toBeCloseTo(expectedTarget.len, 4)
//   //
//   //   const expectedSolveLimbVars = expectedMidVars.solveLimbVars
//   //   expect(solveLimbVars.acbLen.aLen).toBeCloseTo(expectedSolveLimbVars.acbLen.aLen)
//   //   expect(solveLimbVars.acbLen.bLen).toBeCloseTo(expectedSolveLimbVars.acbLen.bLen)
//   //   expect(solveLimbVars.acbLen.cLen).toBeCloseTo(expectedSolveLimbVars.acbLen.cLen)
//   //   expect(solveLimbVars.firstRad).toBeCloseTo(expectedSolveLimbVars.firstRad)
//   //   expect(solveLimbVars.rotAfterAim).toBeCloseToQuaternion(expectedSolveLimbVars.rotAfterAim, 3)
//   //
//   //   const bone0 = targetRig.pose.bones[targetRig.chains[boneName].chainBones[0].index]
//   //   const expectedBone0 = expectedState[targetRig.chains[boneName].chainBones[0].index]
//   //   const bone1 = targetRig.pose.bones[targetRig.chains[boneName].chainBones[1].index]
//   //   const expectedBone1 = expectedState[targetRig.chains[boneName].chainBones[1].index]
//   //   expect(bone0.world.position).toBeCloseToVector(expectedBone0.world.position, 3)
//   //   expect(bone0.world.quaternion).toBeCloseToQuaternion(expectedBone0.world.quaternion, 3)
//   //   expect(bone1.world.position).toBeCloseToVector(expectedBone1.world.position, 3)
//   //   expect(bone1.world.quaternion).toBeCloseToQuaternion(expectedBone1.world.quaternion, 3)
//   //
//   //   targetRig.chains[boneName].chainBones.forEach((boneData) => {
//   //     const subBoneName = boneData.ref.name
//   //     console.log('bone ' + subBoneName)
//   //     const applied = targetRig.pose.bones[boneData.index]
//   //     const expected = expectedState[boneData.index]
//   //
//   //     expect(applied.local.position).toBeCloseToVector(expected.local.position, 4)
//   //     expect(applied.local.quaternion).toBeCloseToQuaternion(expected.local.quaternion, 2)
//   //     expect(applied.world.position).toBeCloseToVector(expected.world.position, 4)
//   //     expect(applied.world.quaternion).toBeCloseToQuaternion(expected.world.quaternion, 2)
//   //   })
//   // })
//   //
//   // test.each(['arm_l', 'arm_r'])('x apply arms %s', (boneName) => {
//   //   // apply animation pose
//   //   const targetAnimBonesStates = adoptBones(poseBonesForArms)
//   //   applyTestPoseState(targetRig.pose, targetAnimBonesStates)
//   //
//   //   const chain = targetRig.chains[boneName]
//   //   const limb = ikPose[boneName]
//   //   const expectedMidVars = expectedMidVarsLimbs[boneName]
//   //   const expectedLimb = expectedMidVars.limb
//   //   expect(chain.length).toBeCloseTo(expectedMidVars.chainLength)
//   //   expect(limb.lengthScale).toBeCloseTo(expectedLimb.len_scale)
//   //   expect(limb.dir).toBeCloseToVector(expectedLimb.dir, 4)
//   //   expect(limb.jointDirection).toBeCloseToVector(expectedLimb.joint_dir, 4)
//   //
//   //   const { preTargetVars, preGroundingVars, solveLimbVars } = applyLimb(ikPose, targetRig, chain, limb, 0)
//   //
//   //   const expectedPreTargetVars = expectedMidVars.preTargetVars
//   //
//   //   const expectedTarget = expectedMidVars.target
//   //
//   //   expect(preTargetVars.c_tran.position).toBeCloseToVector(expectedPreTargetVars.c_tran.pos, 4)
//   //   expect(preTargetVars.c_tran.quaternion).toBeCloseToQuaternion(expectedPreTargetVars.c_tran.rot, 2)
//   //   expect(preTargetVars.c_tran.scale).toBeCloseToVector(expectedPreTargetVars.c_tran.scl, 4)
//   //   expect(preTargetVars.p_tran.position).toBeCloseToVector(expectedPreTargetVars.p_tran.pos, 4)
//   //   expect(preTargetVars.p_tran.quaternion).toBeCloseToQuaternion(expectedPreTargetVars.p_tran.rot, 2)
//   //   expect(preTargetVars.p_tran.scale).toBeCloseToVector(expectedPreTargetVars.p_tran.scl, 4)
//   //
//   //   expect(preTargetVars.len).toBeCloseTo(expectedPreTargetVars.len, 4)
//   //
//   //   expect(preGroundingVars.target.start_pos).toBeCloseToVector(expectedTarget.start_pos, 4)
//   //   expect(preGroundingVars.target.end_pos).toBeCloseToVector(expectedTarget.end_pos, 4)
//   //   expect(preGroundingVars.target.len).toBeCloseTo(expectedTarget.len, 4)
//   //   expect(preGroundingVars.target.len).toBeCloseTo(expectedTarget.len, 4)
//   //
//   //   const expectedSolveLimbVars = expectedMidVars.solveLimbVars
//   //   expect(solveLimbVars.acbLen.aLen).toBeCloseTo(expectedSolveLimbVars.acbLen.aLen)
//   //   expect(solveLimbVars.acbLen.bLen).toBeCloseTo(expectedSolveLimbVars.acbLen.bLen)
//   //   expect(solveLimbVars.acbLen.cLen).toBeCloseTo(expectedSolveLimbVars.acbLen.cLen)
//   //   expect(solveLimbVars.firstRad).toBeCloseTo(expectedSolveLimbVars.firstRad)
//   //   expect(solveLimbVars.rotAfterAim).toBeCloseToQuaternion(expectedSolveLimbVars.rotAfterAim, 3)
//   //
//   //   const bone0 = targetRig.pose.bones[targetRig.chains[boneName].chainBones[0].index]
//   //   const expectedBone0 = expectedState[targetRig.chains[boneName].chainBones[0].index]
//   //   const bone1 = targetRig.pose.bones[targetRig.chains[boneName].chainBones[1].index]
//   //   const expectedBone1 = expectedState[targetRig.chains[boneName].chainBones[1].index]
//   //   expect(bone0.world.position).toBeCloseToVector(expectedBone0.world.position, 3)
//   //   expect(bone0.world.quaternion).toBeCloseToQuaternion(expectedBone0.world.quaternion, 3)
//   //   expect(bone1.world.position).toBeCloseToVector(expectedBone1.world.position, 3)
//   //   expect(bone1.world.quaternion).toBeCloseToQuaternion(expectedBone1.world.quaternion, 3)
//   //
//   //   targetRig.chains[boneName].chainBones.forEach((boneData) => {
//   //     const subBoneName = boneData.ref.name
//   //     console.log('bone ' + subBoneName)
//   //     const applied = targetRig.pose.bones[boneData.index]
//   //     const expected = expectedState[boneData.index]
//   //
//   //     expect(applied.local.position).toBeCloseToVector(expected.local.position, 4)
//   //     expect(applied.local.quaternion).toBeCloseToQuaternion(expected.local.quaternion, 2)
//   //     expect(applied.world.position).toBeCloseToVector(expected.world.position, 4)
//   //     expect(applied.world.quaternion).toBeCloseToQuaternion(expected.world.quaternion, 2)
//   //   })
//   // })

//   test.each(['leg_l', 'leg_r', 'arm_l', 'arm_r'])('apply limb %s', (boneName) => {
//     const targetAnimBonesStates = adoptBones(
//       boneName.startsWith('arm') ? poseBonesWithAppliedHipLegsSpine : poseBonesForLegs
//     )
//     applyTestPoseState(targetRig.pose, targetAnimBonesStates)

//     const chain = targetRig.chains[boneName]
//     const limb = ikPose[boneName]

//     applyLimb(ikPose, targetRig, chain, limb, 0)
//     targetRig.chains[boneName].chainBones.forEach((boneData) => {
//       const subBoneName = boneData.ref.name
//       console.log('bone ' + subBoneName)
//       const applied = targetRig.pose.bones[boneData.index]
//       const expected = expectedState[boneData.index]

//       expect(applied.bone.position).toBeCloseToVector(expected.local.position, 4)
//       expect(applied.bone.quaternion).toBeCloseToQuaternion(expected.local.quaternion, 2)

//       applied.bone.getWorldPosition(boneWorldPosition)
//       applied.bone.getWorldQuaternion(boneWorldRotation)
//       applied.bone.getWorldScale(boneWorldScale)
//       worldToModel(boneWorldPosition, boneWorldRotation, boneWorldScale, targetMeshTransform)

//       expect(boneWorldPosition).toBeCloseToVector(expected.world.position, 4)
//       expect(boneWorldRotation).toBeCloseToQuaternion(expected.world.quaternion, 2)
//     })
//   })

//   const expLTVars = {
//     foot_l: {
//       rootQuaternion: new Quaternion(-0.6234073042869568, 0.052118729799985886, 0.0876801386475563, 0.7752156853675842),
//       childRotation: new Quaternion(-0.9037027359008789, 0.007546038832515478, 0.1017211377620697, 0.4158337116241455),
//       rotation0: new Quaternion(-0.8728105425834656, -0.08188201487064362, 0.1260855495929718, 0.46432748436927795),
//       rotation1: new Quaternion(-0.8694409132003784, -0.07160184532403946, 0.17486561834812164, 0.45647361874580383),
//       rotationFinal: new Quaternion(
//         -0.4048269987106323,
//         -0.11207748204469681,
//         0.005583629477769136,
//         0.9074816107749939
//       ),
//       boneParentQuaternion: new Quaternion(
//         -0.6234073042869568,
//         0.052118729799985886,
//         0.0876801386475563,
//         0.7752156853675842
//       )
//     },
//     // will fail, not correct data
//     foot_r: {
//       rootQuaternion: new Quaternion(
//         -0.9960752129554749,
//         -0.0717119351029396,
//         -0.051414649933576584,
//         -0.006963543593883514
//       ),
//       childRotation: new Quaternion(
//         -0.8884380459785461,
//         -0.0412578247487545,
//         -0.07799931615591049,
//         -0.45043548941612244
//       ),
//       rotation0: new Quaternion(-0.8742867708206177, -0.06174449622631073, -0.026070542633533478, -0.480760782957077),
//       rotation1: new Quaternion(-0.8761219382286072, -0.017853258177638054, -0.008835924789309502, -0.4816782474517822),
//       rotationFinal: new Quaternion(-0.47340238094329834, -0.0706619843840599, 0.0203414149582386, 0.87777179479599),
//       boneParentQuaternion: new Quaternion(
//         -0.9960752129554749,
//         -0.0717119351029396,
//         -0.051414649933576584,
//         -0.006963543593883514
//       )
//     },
//     head: {
//       rootQuaternion: new Quaternion(
//         0.21981044113636017,
//         -0.24237382411956787,
//         0.013499671593308449,
//         0.9448577761650085
//       ),
//       childRotation: new Quaternion(0.34075674414634705, -0.23856309056282043, 0.04488848149776459, 0.9082719087600708),
//       rotation0: new Quaternion(0.23243141174316406, -0.02831265516579151, 0.02757553569972515, 0.9718096256256104),
//       rotation1: new Quaternion(0.2326979637145996, -0.028849102556705475, 0.019845880568027496, 0.9719186425209045),
//       rotationFinal: new Quaternion(0.010649281553924084, 0.2095302939414978, -0.04442760348320007, 0.9767343401908875)
//     }
//   }
//   test.each(['foot_l', 'foot_r', 'head'])('apply look/twist %s', (boneName) => {
//     // --- check that IKPose is correct
//     {
//       expectedIKPose = adoptIKPose(ikposeData)
//       const expected: IKPoseLookTwist = expectedIKPose[boneName]
//       const computed: IKPoseLookTwist = ikPose[boneName]
//       expect(computed.lookDirection).toBeCloseToVector(expected.lookDirection, 4)
//       expect(computed.twistDirection).toBeCloseToVector(expected.twistDirection, 4)
//     }

//     const targetAnimBonesStates = adoptBones(poseBonesWithAppliedHipLegsSpine)
//     applyTestPoseState(targetRig.pose, targetAnimBonesStates)

//     applyLookTwist(ikPose, targetRig, boneName, FORWARD, UP)

//     // --- apply pose to skeleton bones
//     applyPoseToRig(targetRig)

//     const applied = targetRig.pose.bones[targetRig.points[boneName].index]
//     const expected = expectedState[targetRig.points[boneName].index]

//     expect(applied.local.position).toBeCloseToVector(expected.local.position, 4)
//     expect(applied.local.quaternion).toBeCloseToQuaternion(expected.local.quaternion, 2)

//     applied.bone.getWorldPosition(boneWorldPosition)
//     applied.bone.getWorldQuaternion(boneWorldRotation)
//     applied.bone.getWorldScale(boneWorldScale)
//     worldToModel(boneWorldPosition, boneWorldRotation, boneWorldScale, targetMeshTransform)

//     expect(boneWorldPosition).toBeCloseToVector(expected.world.position, 4)
//     expect(boneWorldRotation).toBeCloseToQuaternion(expected.world.quaternion, 2)
//   })

//   test('applyIKRig', () => {
//     applyIKPoseToIKRig(targetRig, ikPose)

//     targetRig.pose.bones.forEach((boneState) => {
//       const expected = expectedState[boneState.idx]
//       console.log('-- pose bone -- name:', boneState.name)
//       expect(boneState.length).toBeCloseTo(expected.length, 4)
//       expect(boneState.bone.position.x).toBeCloseTo(expected.local.position.x)
//       expect(boneState.bone.position.y).toBeCloseTo(expected.local.position.y)
//       expect(boneState.bone.position.z).toBeCloseTo(expected.local.position.z)

//       boneState.bone.getWorldPosition(boneWorldPosition)
//       boneState.bone.getWorldQuaternion(boneWorldRotation)
//       boneState.bone.getWorldScale(boneWorldScale)
//       worldToModel(boneWorldPosition, boneWorldRotation, boneWorldScale, targetMeshTransform)

//       expect(boneWorldPosition).toBeCloseToVector(expected.world.position, 4)
//       expect(boneWorldRotation).toBeCloseToQuaternion(expected.world.quaternion, 2)
//     })
//   })
// })

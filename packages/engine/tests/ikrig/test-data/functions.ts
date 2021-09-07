import { World } from '@xrengine/engine/src/ecs/classes/World'
import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, createEntity, getComponent } from '@xrengine/engine/src/ecs/functions/EntityFunctions'
import { defaultIKPoseComponentValues, IKPose, IKPoseComponentType } from '@xrengine/engine/src/ikrig/components/IKPose'
import { IKRig, IKRigComponentType } from '@xrengine/engine/src/ikrig/components/IKRig'
import { IKObj } from '@xrengine/engine/src/ikrig/components/IKObj'
import { bones } from './pose1/ikrig.pose.bones'
import { bones as tbones } from './ikrig.tpose.bones'
import {
  fungiSerializedIKPose,
  fungiSerializedPoseBones,
  fungiSerializedQuaternion,
  fungiSerializedVector3
} from './ikrig.tests.types'
import { Bone, Group, Quaternion, Skeleton, SkinnedMesh, Vector3 } from 'three'
import Pose, { PoseBoneLocalState } from '../../../src/ikrig/classes/Pose'
import { addChain, addPoint } from '../../../src/ikrig/functions/RigFunctions'
import { BACK, DOWN, UP, FORWARD, LEFT, RIGHT } from '@xrengine/engine/src/ikrig/constants/Vector3Constants'
// import * as rawRig from './IKRig.run-1.json'

export function setupTestSourceEntity(sourceEntity: Entity, world: World): void {
  const bonesStates = adoptBones(bones)
  const tbonesStates = adoptBones(tbones)
  const { mesh: skinnedMesh } = createSkinnedMesh(tbonesStates)

  addComponent(sourceEntity, IKObj, { ref: skinnedMesh })
  const sourcePose = addComponent(sourceEntity, IKPose, defaultIKPoseComponentValues())
  const rig = addComponent(sourceEntity, IKRig, {
    tpose: null,
    pose: null,
    chains: {},
    points: {},
    sourcePose: null,
    sourceRig: null
  })

  // @ts-ignore
  rig.sourceRig = skinnedMesh
  rig.sourcePose = sourcePose

  rig.pose = new Pose(sourceEntity, false)
  rig.tpose = new Pose(sourceEntity, true) // If Passing a TPose, it must have its world space computed.

  console.log('rig.pose.bones[0].local.position.z', rig.pose.bones[0].local.position.z)

  //-----------------------------------------
  // Apply Node's Starting Transform as an offset for poses.
  // This is only important when computing World Space Transforms when
  // dealing with specific skeletons, like Mixamo stuff.
  // Need to do this to render things correctly
  // TODO: Verify the numbers of this vs the original
  let objRoot = getComponent(sourceEntity, IKObj).ref // Obj is a ThreeJS Component
  rig.pose.setOffset(objRoot.quaternion, objRoot.position, objRoot.scale)
  rig.tpose.setOffset(objRoot.quaternion, objRoot.position, objRoot.scale)

  /// init mixamo

  rig.points = {}
  rig.chains = {}

  addPoint(sourceEntity, 'hip', 'Hips')
  addPoint(sourceEntity, 'head', 'Head')
  addPoint(sourceEntity, 'neck', 'Neck')
  addPoint(sourceEntity, 'chest', 'Spine2')
  addPoint(sourceEntity, 'foot_l', 'LeftFoot')
  addPoint(sourceEntity, 'foot_r', 'RightFoot')
  addChain(sourceEntity, 'arm_r', ['RightArm', 'RightForeArm'], 'RightHand') //"x",
  addChain(sourceEntity, 'arm_l', ['LeftArm', 'LeftForeArm'], 'LeftHand') //"x",
  addChain(sourceEntity, 'leg_r', ['RightUpLeg', 'RightLeg'], 'RightFoot') //"z",
  addChain(sourceEntity, 'leg_l', ['LeftUpLeg', 'LeftLeg'], 'LeftFoot') //"z",
  addChain(sourceEntity, 'spine', ['Spine', 'Spine1', 'Spine2']) //, "y"

  rig.chains.leg_l.computeLengthFromBones(rig.tpose.bones)
  rig.chains.leg_r.computeLengthFromBones(rig.tpose.bones)
  rig.chains.arm_l.computeLengthFromBones(rig.tpose.bones)
  rig.chains.arm_r.computeLengthFromBones(rig.tpose.bones)
  rig.chains.leg_l.setOffsets(DOWN, FORWARD, rig.tpose)
  rig.chains.leg_r.setOffsets(DOWN, FORWARD, rig.tpose)
  rig.chains.arm_r.setOffsets(RIGHT, BACK, rig.tpose)
  rig.chains.arm_l.setOffsets(LEFT, BACK, rig.tpose)

  /// init mixamo

  console.log('rig.pose.bones[0].local.position.z', rig.pose.bones[0].local.position.z)

  rig.tpose.apply()

  console.log('rig.pose.bones[0].local.position.z', rig.pose.bones[0].local.position.z)
}

export function applyPoseState(pose: Pose, bonesStates: PoseBoneLocalState[]) {
  pose.bones.forEach((value, index) => {
    const state = bonesStates[index]

    value.local.position.copy(state.local.position)
    value.local.quaternion.copy(state.local.quaternion)
    value.local.scale.copy(state.local.scale)
    value.world.position.copy(state.world.position)
    value.world.quaternion.copy(state.world.quaternion)
    value.world.scale.copy(state.world.scale)

    value.bone.position.copy(state.bone.position)
    value.bone.quaternion.copy(state.bone.quaternion)
    value.bone.scale.copy(state.bone.scale)

    value.length = state.length
  })
}

export function getTestIKPoseData(): IKPoseComponentType {
  const data: Partial<IKPoseComponentType> = {}

  // console.log('pose', pose)

  return data
}

export function getTestIKRigData(): IKRigComponentType {
  const data: Partial<IKRigComponentType> = {
    tpose: null,
    pose: null,
    chains: null,
    points: null,
    sourcePose: null,
    sourceRig: null
  }

  // console.log('rawRig', rawRig)
  // data.pose = new Pose(entity, false)

  return data
}

export function createSkinnedMesh(bonesStates: PoseBoneLocalState[]): { group: Group; mesh: SkinnedMesh } {
  const hipsBone = bonesStates.find((bs) => bs.name === 'Hips').bone
  console.log('hipBone', hipsBone)
  const bones = []
  hipsBone.traverse((b) => (b.type === 'Bone' ? bones.push(b) : null))
  console.log('bonesStates', bonesStates)
  console.log('bones', bones)
  const skinnedMesh = new SkinnedMesh()
  const skeleton = new Skeleton(bones)
  skinnedMesh.bind(skeleton)

  const group = new Group()
  group.add(skinnedMesh)
  group.add(hipsBone)

  return { group, mesh: skinnedMesh }
}

export function adoptBones(rawBones: fungiSerializedPoseBones[]): PoseBoneLocalState[] {
  const bonesData = rawBones.map((rawBone) => {
    const bone = new Bone()
    const state = {
      bone,
      idx: rawBone.idx,
      p_idx: rawBone.p_idx,
      name: rawBone.name,
      length: rawBone.len,
      parent: null, // TODO add parent
      chg_state: rawBone.chg_state,
      local: {
        position: vector3FromSerialized(rawBone.local.pos),
        quaternion: quaternionFromSerialized(rawBone.local.rot),
        scale: vector3FromSerialized(rawBone.local.scl)
      },
      world: {
        position: vector3FromSerialized(rawBone.world.pos),
        quaternion: quaternionFromSerialized(rawBone.world.rot),
        scale: vector3FromSerialized(rawBone.world.scl)
      }
    }
    bone.name = state.name
    bone.position.copy(state.local.position)
    bone.quaternion.copy(state.local.quaternion)
    bone.scale.copy(state.local.scale)

    return state
  })

  bonesData.forEach((boneData) => {
    if (boneData.p_idx !== null) {
      const parent = bonesData[boneData.p_idx].bone
      boneData.parent = parent
      parent.add(boneData.bone)
    }
  })

  return bonesData
}

export function adoptIKPose(ikposeData: fungiSerializedIKPose): IKPoseComponentType {
  const ikpose: Partial<IKPoseComponentType> = {}

  ikpose.length = ikposeData.target.len
  ikpose.startPosition = vector3FromSerialized(ikposeData.target.start_pos)
  ikpose.endPosition = vector3FromSerialized(ikposeData.target.end_pos)
  // TODO: axis
  // ikpose.axis

  // TODO: we need this?
  /*
  spineParentQuaternion?: Quaternion
  spineParentPosition?: Vector3
  spineParentScale?: Vector3

  spineChildQuaternion?: Quaternion
  spineChildPosition?: Vector3
  spineChildScale?: Vector3
   */

  ikpose.hip = {
    bind_height: ikposeData.hip.bind_height,
    twist: ikposeData.hip.twist,
    dir: vector3FromSerialized(ikposeData.hip.dir),
    movement: vector3FromSerialized(ikposeData.hip.movement)
  }

  ikpose.foot_l = {
    lookDirection: vector3FromSerialized(ikposeData.foot_l.look_dir),
    twistDirection: vector3FromSerialized(ikposeData.foot_l.twist_dir)
  }
  ikpose.foot_r = {
    lookDirection: vector3FromSerialized(ikposeData.foot_r.look_dir),
    twistDirection: vector3FromSerialized(ikposeData.foot_r.twist_dir)
  }

  ikpose.leg_l = {
    dir: vector3FromSerialized(ikposeData.leg_l.dir),
    jointDirection: vector3FromSerialized(ikposeData.leg_l.joint_dir),
    lengthScale: ikposeData.leg_l.len_scale
  }
  ikpose.leg_r = {
    dir: vector3FromSerialized(ikposeData.leg_r.dir),
    jointDirection: vector3FromSerialized(ikposeData.leg_r.joint_dir),
    lengthScale: ikposeData.leg_r.len_scale
  }

  ikpose.arm_l = {
    dir: vector3FromSerialized(ikposeData.arm_l.dir),
    jointDirection: vector3FromSerialized(ikposeData.arm_l.joint_dir),
    lengthScale: ikposeData.arm_l.len_scale
  }
  ikpose.arm_r = {
    dir: vector3FromSerialized(ikposeData.arm_r.dir),
    jointDirection: vector3FromSerialized(ikposeData.arm_r.joint_dir),
    lengthScale: ikposeData.arm_r.len_scale
  }

  ikpose.spine = [
    {
      lookDirection: vector3FromSerialized(ikposeData.spine[0].look_dir),
      twistDirection: vector3FromSerialized(ikposeData.spine[0].twist_dir)
    },
    {
      lookDirection: vector3FromSerialized(ikposeData.spine[1].look_dir),
      twistDirection: vector3FromSerialized(ikposeData.spine[1].twist_dir)
    }
  ]

  ikpose.head = {
    lookDirection: vector3FromSerialized(ikposeData.head.look_dir),
    twistDirection: vector3FromSerialized(ikposeData.head.twist_dir)
  }

  return ikpose
}

function vector3FromSerialized(sv: fungiSerializedVector3): Vector3 {
  return new Vector3(sv['0'], sv['1'], sv['2'])
}

function quaternionFromSerialized(sv: fungiSerializedQuaternion): Quaternion {
  return new Quaternion(sv['0'], sv['1'], sv['2'], sv['3'])
}

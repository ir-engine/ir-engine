import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { addComponent, getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import {
  defaultIKPoseComponentValues,
  IKPoseComponent,
  IKPoseComponentType
} from '@xrengine/engine/src/ikrig/components/IKPoseComponent'
import { IKObj } from '@xrengine/engine/src/ikrig/components/IKObj'
import { bones } from './pose1/ikrig.pose.bones'
import { bones as tbones } from './ikrig.tpose.bones'
import { rigData as rig2Data } from './rig2.data'
import {
  fungiSerializedIKPose,
  fungiSerializedPoseBones,
  fungiSerializedQuaternion,
  fungiSerializedVector3
} from './ikrig.tests.types'
import { Bone, Group, Quaternion, Skeleton, SkinnedMesh, Vector3 } from 'three'
import Pose, { PoseBoneLocalState } from '../../../src/ikrig/classes/Pose'
import { addRig, addTargetRig } from '../../../src/ikrig/functions/RigFunctions'

export const sourceMeshTransform = {
  position: new Vector3(100, 100, 100),
  quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(-1, 1, 1).normalize()),
  scale: new Vector3(10, 10, 10)
}
export const targetMeshTransform = {
  position: new Vector3(-1000, -1000, -1000),
  quaternion: new Quaternion().setFromUnitVectors(new Vector3(0, 1, 0), new Vector3(1, 1, 1).normalize()),
  scale: new Vector3(0.5, 0.5, 0.5)
}
// export const targetMeshTransform = {
//   position: new Vector3(0, 0, 0),
//   quaternion: new Quaternion(),
//   scale: new Vector3(1, 1, 1)
// }

export function setupTestSourceEntity(sourceEntity: Entity): void {
  const bonesStates = adoptBones(bones)
  const tbonesStates = adoptBones(tbones)
  const { group, mesh: skinnedMesh } = createSkinnedMesh(tbonesStates)
  skinnedMesh.parent?.position.copy(sourceMeshTransform.position)
  skinnedMesh.parent?.quaternion.copy(sourceMeshTransform.quaternion)
  skinnedMesh.parent?.scale.copy(sourceMeshTransform.scale)

  const rig = addRig(sourceEntity, group)
  const sourcePose = addComponent(sourceEntity, IKPoseComponent, defaultIKPoseComponentValues())

  // TODO: remove?
  const objRoot = getComponent(sourceEntity, IKObj).ref // Obj is a ThreeJS Component
  const rootQuaternion = new Quaternion()
  const rootPosition = new Vector3()
  const rootScale = new Vector3()

  objRoot.parent?.getWorldQuaternion(rootQuaternion)
  objRoot.parent?.getWorldPosition(rootPosition)
  objRoot.parent?.getWorldScale(rootScale)
}

export function setupTestTargetEntity(targetEntity: Entity): void {
  const tbonesStates = adoptBones(rig2Data.tpose.bones)
  const { group, mesh: skinnedMesh } = createSkinnedMesh(tbonesStates)
  skinnedMesh.parent?.position.copy(targetMeshTransform.position)
  skinnedMesh.parent?.quaternion.copy(targetMeshTransform.quaternion)
  skinnedMesh.parent?.scale.copy(targetMeshTransform.scale)

  addTargetRig(targetEntity, group)
  // const sourcePose = addComponent(targetEntity, IKPoseComponent, defaultIKPoseComponentValues())
}

export function applyTestPoseState(pose: Pose, bonesStates: PoseBoneLocalState[]) {
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

  pose.bones.forEach((value, index) => {
    value.bone.updateMatrixWorld()
  })
}

export function createSkinnedMesh(bonesStates: PoseBoneLocalState[]): { group: Group; mesh: SkinnedMesh } {
  const hipsBone = bonesStates.find((bs) => bs.name === 'Hips')!.bone
  const bones: any[] = []
  hipsBone.traverse((b) => (b.type === 'Bone' ? bones.push(b) : null))
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
    const state: PoseBoneLocalState = {
      bone,
      idx: rawBone.idx,
      p_idx: rawBone.p_idx,
      name: rawBone.name,
      length: rawBone.len,
      parent: null,
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

export function vector3FromSerialized(sv: fungiSerializedVector3): Vector3 {
  return new Vector3(sv['0'], sv['1'], sv['2'])
}

export function quaternionFromSerialized(sv: fungiSerializedQuaternion): Quaternion {
  return new Quaternion(sv['0'], sv['1'], sv['2'], sv['3'])
}

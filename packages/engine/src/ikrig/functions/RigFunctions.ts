import { SkinnedMesh, Vector3 } from 'three'
import { getComponent } from '../../ecs/functions/ComponentFunctions'
import { Chain } from '../components/Chain'
import { IKObj } from '../components/IKObj'
import { IKRigComponent } from '../components/IKRigComponent'
import { ArmatureType } from '../enums/ArmatureType'
import { Entity } from '../../ecs/classes/Entity'
import Pose from '../classes/Pose'
import { setupMixamoIKRig, setupTRexIKRig } from './IKFunctions'
import { IKSolverFunction, solveLimb } from './IKSolvers'

export function initRig(
  entity: Entity,
  tpose = null,
  use_node_offset = false,
  arm_type: ArmatureType = ArmatureType.MIXAMO
) {
  const rig = getComponent(entity, IKRigComponent)
  // const armature = getComponent(entity, Armature)

  // rig.arm = armature
  // Set up poses
  rig.pose = new Pose(entity, false)
  rig.tpose = new Pose(entity, true) // If Passing a TPose, it must have its world space computed.

  //-----------------------------------------
  // Apply Node's Starting Transform as an offset for poses.
  // This is only important when computing World Space Transforms when
  // dealing with specific skeletons, like Mixamo stuff.
  // Need to do this to render things correctly
  // TODO: Verify the numbers of this vs the original
  let objRoot = getComponent(entity, IKObj).ref // Obj is a ThreeJS Component
  rig.pose.setOffset(objRoot.quaternion, objRoot.position, objRoot.scale)
  rig.tpose.setOffset(objRoot.quaternion, objRoot.position, objRoot.scale)

  //
  // //-----------------------------------------
  // // Apply Node's Starting Transform as an offset for poses.
  // // This is only important when computing World Space Transforms when
  // // dealing with specific skeletons, like Mixamo stuff.
  // // Need to do this to render things correctly
  // if (use_node_offset) {
  //   let l = entity.Obj ? entity.Obj.get_transform() : entity.Node.local // Obj is a ThreeJS Component
  //
  //   this.pose.set_offset(l.rot, l.pos, l.scl)
  //   if (!tpose) this.tpose.set_offset(l.rot, l.pos, l.scl)
  // }
  //
  // //-----------------------------------------
  // // If TPose Was Created by Rig, it does not have its world
  // // Space Computed. Must do this after setting offset to work right.
  // if (!tpose) this.tpose.update_world()
  //
  // //-----------------------------------------
  // // Auto Setup the Points and Chains based on
  // // Known Skeleton Structures.
  switch (arm_type) {
    case ArmatureType.MIXAMO:
      setupMixamoIKRig(entity, rig)
      break
    case ArmatureType.TREX:
      setupTRexIKRig(entity, rig)
      break
    default:
      console.error('Unsupported rig type', arm_type)
  }

  rig.tpose.apply()

  return rig
}

function initMixamoRig(armature, rig) {
  console.error('initMixamoRig NOT IMPLEMENTED')
}

export function addPoint(entity: Entity, name: string, boneName: string): void {
  const armature = getComponent(entity, IKObj).ref
  const rig = getComponent(entity, IKRigComponent)
  rig.points[name] = {
    index: armature.skeleton.bones.findIndex((bone) => bone.name.includes(boneName))
  }
}
export function addChain(
  entity: Entity,
  name: string,
  nameArray: string[],
  end_name: string | null = null,
  ikSolver: IKSolverFunction | null = null
) {
  //  axis="z",
  let boneName: string, b
  const armature = getComponent(entity, IKObj).ref
  const rig = getComponent(entity, IKRigComponent)

  const chain = new Chain() // axis
  for (boneName of nameArray) {
    const index = armature.skeleton.bones.findIndex((bone) => bone.name.includes(boneName))
    // TODO: skip the bone? or skip the chain? or throw error?
    if (index === -1) {
      console.warn('addChain: Bone [%s] not found in armature', boneName, armature)
      continue
    }
    const bone = armature.skeleton.bones[index]

    let length = 0
    if (bone.children.length > 0) {
      length = bone.children[0].position.length()
    }
    const o = { index, ref: bone, length }

    chain.chainBones.push(o)
    chain.cnt++
    chain.length += length
  }

  if (end_name) {
    chain.end_idx = armature.skeleton.bones.findIndex((bone) =>
      bone.name.toLowerCase().includes(end_name.toLowerCase())
    )
  }

  chain.ikSolver = ikSolver ?? solveLimb

  rig.chains[name] = chain
}

export function setPosition(entity: Entity, ...p: number[]) {
  const { ref } = getComponent(entity, IKObj)
  if (p.length == 3) ref.position.fromArray(p)
}

export function getRigTransform(entity: Entity) {
  const { ref } = getComponent(entity, IKObj)
  const p = ref.position,
    q = ref.quaternion,
    s = ref.scale
  return {
    position: [p.x, p.y, p.z],
    quaternion: [q.x, q.y, q.z, q.w],
    scale: [s.x, s.y, s.z]
  }
}

export function setReference(entity: Entity, o: SkinnedMesh) {
  getComponent(entity, IKObj).ref = o
  // Engine.scene.add( o );
}

import { Object3D, SkinnedMesh } from 'three'

import { Entity } from '../../ecs/classes/Entity'
import { addComponent, getComponent, hasComponent, removeComponent } from '../../ecs/functions/ComponentFunctions'
import { Chain } from '../classes/Chain'
import Pose from '../classes/Pose'
import { IKObj } from '../components/IKObj'
import { IKRigComponent, IKRigComponentType, IKRigTargetComponent } from '../components/IKRigComponent'
import { ArmatureType } from '../enums/ArmatureType'
import { setupMixamoIKRig, setupTRexIKRig } from './IKFunctions'
import { IKSolverFunction, solveLimb } from './IKSolvers'

export function addRig(
  entity: Entity,
  rootObject: Object3D,
  tpose = null,
  use_node_offset = false,
  arm_type: ArmatureType = ArmatureType.MIXAMO
): IKRigComponentType {
  return _addRig(IKRigComponent, entity, rootObject, tpose, use_node_offset, arm_type)
}

export function addTargetRig(
  entity: Entity,
  rootObject: Object3D,
  tpose = null,
  use_node_offset = false,
  arm_type: ArmatureType = ArmatureType.MIXAMO
): IKRigComponentType {
  return _addRig(IKRigTargetComponent, entity, rootObject, tpose, use_node_offset, arm_type)
}

function _addRig(
  componentClass: typeof IKRigComponent | typeof IKRigTargetComponent,
  entity: Entity,
  rootObject: Object3D,
  tpose = null,
  use_node_offset = false,
  arm_type: ArmatureType = ArmatureType.MIXAMO
): IKRigComponentType {
  // NOTE: rootObject should contain skinnedMesh and it's bones
  const skinnedMesh = rootObject.getObjectByProperty('type', 'SkinnedMesh') as SkinnedMesh

  // remove change callbacks for perf optimization
  rootObject.traverse((child) => {
    child.quaternion._onChange(noop)
    child.rotation._onChange(noop)
  })

  if (hasComponent(entity, componentClass)) removeComponent(entity, componentClass)
  if (hasComponent(entity, IKObj)) removeComponent(entity, IKObj)
  addComponent(entity, IKObj, { ref: skinnedMesh })
  const rig = addComponent(entity, componentClass, {
    rootParent: rootObject,
    tpose: new Pose(rootObject, true), // If Passing a TPose, it must have its world space computed.
    pose: new Pose(rootObject, false),
    chains: {}, // will be populated later in setup rig
    points: {} // will be populated later in setup rig
  })

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
      setupMixamoIKRig(rig)
      break
    case ArmatureType.TREX:
      setupTRexIKRig(rig)
      break
    default:
      console.error('Unsupported rig type', arm_type)
  }

  rig.tpose.apply()

  if (!Object.keys(rig.chains).length || !Object.keys(rig.points).length) {
    debugger
  }

  return rig
}

const noop = () => {}

function initMixamoRig(armature, rig) {
  console.error('initMixamoRig NOT IMPLEMENTED')
}

export function addPoint(rig: IKRigComponentType, name: string, boneName: string): void {
  const bones = rig.tpose.bones
  rig.points[name] = {
    index: bones.findIndex((bone) => bone.name.includes(boneName))
  }
}

export function addChain(
  rig: IKRigComponentType,
  name: string,
  nameArray: string[],
  end_name: string | null = null,
  ikSolver: IKSolverFunction | null = null
) {
  //  axis="z",
  let boneName: string, b
  const bones = rig.tpose.bones

  const chain = new Chain() // axis
  for (boneName of nameArray) {
    const index = bones.findIndex((bone) => bone.name.includes(boneName))
    // TODO: skip the bone? or skip the chain? or throw error?
    if (index === -1) {
      console.warn('addChain: Bone [%s] not found in armature', boneName, bones)
      continue
    }
    const bone = bones[index].bone

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
    chain.end_idx = bones.findIndex((bone) => bone.name.toLowerCase().includes(end_name.toLowerCase()))
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

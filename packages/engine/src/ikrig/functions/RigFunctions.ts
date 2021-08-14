import { Vector3 } from 'three'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import { Chain } from '../components/Chain'
import { IKObj } from '../components/IKObj'
import { IKRig } from '../components/IKRig'

export function addPoint(entity, name, boneName) {
  const armature = getComponent(entity, IKObj).ref
  this.points[name] = {
    index: armature.skeleton.bones.findIndex((bone) => bone.name.includes(boneName))
  }
}
export function addChain(entity, name, nameArray, end_name = null) {
  //  axis="z",
  let i, b
  const armature = getComponent(entity, IKObj).ref
  const rig = getComponent(entity, IKRig)

  const chain = new Chain() // axis
  for (i of nameArray) {
    const index = armature.skeleton.bones.findIndex((bone) => bone.name.includes(i))
    const bone = armature.skeleton.bones[index]
    bone.index = index

    const boneWorldPosition = new Vector3()
    bone.getWorldPosition(boneWorldPosition)

    const boneChildWorldPosition = new Vector3()
    bone.children[0].getWorldPosition(boneChildWorldPosition)

    bone.length = bone.children.length > 0 ? boneWorldPosition.distanceTo(boneChildWorldPosition) : 0

    const o = { index, ref: bone, length: bone.length }

    chain.chainBones.push(o)
    chain.cnt++
    chain.length += length
  }

  if (end_name) {
    chain.end_idx = armature.skeleton.bones.findIndex((bone) =>
      bone.name.toLowerCase().includes(end_name.toLowerCase())
    )
  }

  rig.chains[name] = chain
}

export function setPosition(entity, ...p) {
  const { ref } = getComponent(entity, IKObj)
  if (p.length == 3) ref.position.fromArray(p)
}

export function getTransform(entity) {
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

export function setReference(entity, o) {
  getComponent(entity, IKObj).ref = o
  // Engine.scene.add( o );
}

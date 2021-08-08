import { Vector3 } from 'three'
import { Component } from '../../ecs/classes/Component'
import { getComponent } from '../../ecs/functions/EntityFunctions'
import Pose from '../classes/Pose'
import { Chain } from './Chain'
import { IKPose } from './IKPose'
import Obj from './Obj'

class IKRig extends Component<IKRig> {
  tpose: Pose = null // Base pose to calculate math from
  pose: Pose = null // Working pose to apply math to and copy back to bones
  chains: any = {} // IK Chains
  points: any = {} // Individual IK points (hands, head, feet)

  sourcePose: IKPose
  sourceRig: IKRig

  addPoint(name, boneName) {
    const armature = getComponent(this.entity, Obj).ref
    this.points[name] = {
      index: armature.skeleton.bones.findIndex((bone) => bone.name.includes(boneName))
    }
    return this
  }

  addChain(name, nameArray, end_name = null) {
    //  axis="z",
    let i, b
    const armature = getComponent(this.entity, Obj).ref

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

    this.chains[name] = chain
    return this
  }
}

export default IKRig

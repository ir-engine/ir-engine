import { Bone, SkinnedMesh } from 'three'
import { Object3D, Quaternion, Skeleton, Vector3 } from 'three'

import { bonesData2 } from '@xrengine/engine/src/avatar/DefaultSkeletonBones'

import { SkeletonUtils } from '../../avatar/SkeletonUtils'
import { Entity } from '../../ecs/classes/Entity'
import { DOWN, LEFT, RIGHT } from '../constants/Vector3Constants'
import { alignBoneForward, alignChain, spinBoneForward, worldToModel } from '../functions/IKFunctions'
import { transformAdd } from '../functions/IKSolvers'

export type BoneTransform = {
  position: Vector3
  quaternion: Quaternion
  scale: Vector3
}

export type PoseBoneLocalState = {
  bone: Bone
  parent: Bone | null
  changeState: number // If Local Has Been Updated
  index: number // Bone Index in Armature
  parentIndex: number // Parent Bone Index in Armature
  length: number // Length of Bone
  name: string
  local: BoneTransform // Local Transform, use Bind pose as default
  world: BoneTransform // Model Space Transform
}

class Pose {
  static ROTATION = 1
  static POSITION = 2
  static SCALE = 4

  entity: Entity
  skeleton: Skeleton
  bones: PoseBoneLocalState[]
  rootOffset = {
    quaternion: new Quaternion(),
    position: new Vector3(),
    scale: new Vector3(1, 1, 1)
  }
  helper: any

  alignLeg(boneNames: string[]) {
    alignChain(this, DOWN, boneNames)
    return this
  }
  alignArmLeft(boneNames: string[]) {
    alignChain(this, LEFT, boneNames)
    return this
  }
  alignArmRight(boneNames: string[]) {
    alignChain(this, RIGHT, boneNames)
    return this
  }

  alignFoot(boneName: string) {
    spinBoneForward(this, boneName)
    alignBoneForward(this, boneName)
    return this
  }

  spinBoneForward(boneName: string) {
    spinBoneForward(this, boneName)
    return this
  }
  alignBoneForward(boneName: string) {
    alignBoneForward(this, boneName)
    return this
  }

  /**
   *
   * @param rootObject object containing skinnedMesh and it's bones
   * @param clone make a cloned version of skeleton
   */
  constructor(rootObject: Object3D, clone = false) {
    this.bones = []
    const parent: Object3D = clone ? SkeletonUtils.clone(rootObject) : rootObject
    const skeleton = this.getAllSkeleton(parent) // Recreation of Bone Hierarchy

    if (!skeleton) {
      console.warn('Could not find skeleton object', this, rootObject, clone)
      return
    }

    this.skeleton = skeleton

    // this.bones = this.skeleton.bones
    this.rootOffset = new Object3D() // Parent Transform for Root Bone ( Skeletons from FBX imports need this to render right )

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Create Bone Transform Hierarchy to do transformations
    // without changing the actual armature.
    const skeletonTransform = {
      position: new Vector3(),
      quaternion: new Quaternion(),
      invQuaternion: new Quaternion(),
      scale: new Vector3()
    }

    let rootBone = this.skeleton.bones.find((b) => !(b.parent instanceof Bone))

    if (!rootBone) {
      console.warn('Could not find skeleton root bone', skeleton)
      rootBone = this.skeleton.bones[0].parent?.parent as Bone
    }

    ;(skeleton as any).rootBone = rootBone
    rootBone!.updateWorldMatrix(true, true)

    if (rootBone!.parent) {
      rootBone!.parent.matrixWorld.decompose(
        skeletonTransform.position,
        skeletonTransform.quaternion,
        skeletonTransform.scale
      )
      skeletonTransform.invQuaternion.copy(skeletonTransform.quaternion).invert()
    }

    for (let i = 0; i < this.skeleton.bones.length; i++) {
      const bone = this.skeleton.bones[i]
      let parentIndex, boneParent
      if (bone.parent && bone.parent instanceof Bone) {
        parentIndex = this.skeleton.bones.indexOf(bone.parent)
        boneParent = bone.parent
      }

      const boneData = {
        bone,
        parent: boneParent,
        changeState: 0, // If Local Has Been Updated
        index: i, // Bone Index in Armature
        parentIndex, // Parent Bone Index in Armature
        length: 0.1, // Length of Bone
        name: bone.name,
        local: {
          position: bone.position.clone(),
          quaternion: bone.quaternion.clone(),
          scale: bone.scale.clone()
        }, // Local Transform, use Bind pose as default
        world: {
          position: new Vector3(),
          quaternion: new Quaternion(),
          invQuaternion: new Quaternion(),
          scale: new Vector3()
        } // Model Space Transform
      }

      bone.matrixWorld.decompose(boneData.world.position, boneData.world.quaternion, boneData.world.scale)

      // convert to model space
      worldToModel(boneData.world.position, boneData.world.quaternion, boneData.world.scale, skeletonTransform)
      // Calculate this once for tpose
      boneData.world.invQuaternion.copy(boneData.world.quaternion).invert()

      //b['index'] = i
      if (bone.children.length > 0) {
        // b.getWorldPosition(bWorldPosition)
        // b.children[0].getWorldPosition(bChildWorldPosition)
        // bWorldPosition.divide(skeletonTransform.scale)
        // bChildWorldPosition.divide(skeletonTransform.scale)

        boneData.length = bone.children[0].position.length()
      }

      this.bones[i] = boneData
    }

    this.skeleton.update()
  }

  getAllSkeleton(rootObject: Object3D): Skeleton | null {
    let bones: any[] = []

    rootObject.traverse((object: SkinnedMesh) => {
      if (object.isSkinnedMesh && object.skeleton !== null) {
        object.skeleton.bones.forEach((bone) => {
          if (bones.indexOf(bone) == -1) {
            if (bone.parent && bone.parent.type !== 'Bone') {
              bones.unshift(bone)
            } else {
              bones.push(bone)
            }
          }
        })
      }
    })

    let reOrderedBones: any[] = []

    bonesData2.forEach((value) => {
      const selected = bones.find((bone) => bone.name == value.name)
      if (selected) {
        reOrderedBones.push(selected)
      }
    })

    bones.forEach((value) => {
      const selected = reOrderedBones.find((bone) => bone.name == value.name)
      if (!selected) {
        reOrderedBones.push(value)
      }
    })

    const skeleton = new Skeleton(reOrderedBones)

    return skeleton
  }

  getSkeleton(rootObject: Object3D): Skeleton | null {
    let skeleton: Skeleton | null = null

    rootObject.traverse((object: SkinnedMesh) => {
      if (object.isSkinnedMesh && object.skeleton !== null) {
        if (skeleton && skeleton.bones.length > object.skeleton.bones.length) {
          return
        }
        skeleton = object.skeleton
      }
    })

    return skeleton
  }

  setOffset(quaternion: Quaternion, position: Vector3, scale: Vector3) {
    this.rootOffset.quaternion.copy(quaternion)
    this.rootOffset.position.copy(position)
    this.rootOffset.scale.copy(scale)
    return this
  }

  setBone(index: number, quaternion?: Quaternion, position?: Vector3, scale?: Vector3) {
    // TODO: check this out, they store this in separate structure that does not change original bone data
    if (quaternion) this.bones[index].local.quaternion.copy(quaternion)
    if (position) this.bones[index].local.position.copy(position)
    if (scale) this.bones[index].local.scale.copy(scale)
    return this
  }

  getBone(name: string): PoseBoneLocalState | undefined {
    // TODO: replace with Map?
    return this.bones.find((b) => b.name === name)
  }

  apply(): Pose {
    // Copies modified LquatInverseocal Transforms of the Pose to the Bone Entities.
    // const targetSkeleton: Skeleton = getComponent(this.entity, IKObj).ref.skeleton

    let poseBone: PoseBoneLocalState, // Pose Bone
      bone: Bone // Bone Object
    for (let i = 0; i < this.skeleton.bones.length; i++) {
      poseBone = this.bones[i]

      // Check if bone has been modified in the pose
      bone = this.skeleton.bones[i]
      // Copy changes to Bone Entity
      // o.setRotationFromQuaternion(pb.quaternion)

      bone.quaternion.copy(poseBone.local.quaternion)
      bone.position.copy(poseBone.local.position)
      bone.scale.copy(poseBone.local.scale)
    }
    this.skeleton.update()
    // targetSkeleton.update()
    return this
  }

  getParentRotation(boneIndex: number, outQuat: Quaternion): Quaternion {
    const cbone = this.bones[boneIndex]
    outQuat.identity()

    //TODO: Prevent re-calculation of the chain on every call

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // Child is a Root Bone, just reset since there is no parent.
    if (cbone.parentIndex == null) outQuat.identity()
    else {
      // Parents Exist, loop till reaching the root
      let b = this.bones[cbone.parentIndex]
      outQuat.copy(b.local.quaternion)

      while (b.parentIndex != null) {
        b = this.bones[b.parentIndex]
        outQuat.premultiply(b.local.quaternion)
      }
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    outQuat.premultiply(this.rootOffset.quaternion) // Add Starting Offset
    return outQuat
  }

  transformAddRev(pt: BoneTransform, ct: BoneTransform) {
    pt.position.multiply(ct.scale).applyQuaternion(ct.quaternion).add(ct.position)
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // SCALE - parent.scale * child.scale
    pt.scale.multiply(ct.scale)
    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    // ROTATION - parent.rotation * child.rotation
    pt.quaternion.premultiply(ct.quaternion) // Must Rotate from Parent->Child, need PMUL
  }

  getParentWorld(boneIndex: number, pt: BoneTransform, ct: BoneTransform, t_offset?: BoneTransform) {
    const cbone = this.bones[boneIndex]

    //TODO: Prevent re-calculation of the chain on every call

    // Child is a Root Bone, just reset since there is no parent.
    if (cbone.parentIndex == null) {
      pt.position.setScalar(0)
      pt.scale.setScalar(0)
      pt.quaternion.identity()
    } else {
      // Parents Exist, loop till reaching the root
      let b = this.bones[cbone.parentIndex]
      pt.position.copy(b.local.position)
      pt.scale.copy(b.local.scale)
      pt.quaternion.copy(b.local.quaternion)

      while (b.parentIndex != null) {
        b = this.bones[b.parentIndex]
        this.transformAddRev(pt, b.local)
      }
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    this.transformAddRev(pt, this.rootOffset) // Add Starting Offset
    if (t_offset) {
      this.transformAddRev(pt, t_offset) // Add Additional Starting Offset
    }

    if (ct) {
      ct.position.copy(pt.position)
      ct.scale.copy(pt.scale)
      ct.quaternion.copy(pt.quaternion)
      transformAdd(ct, cbone.local) // Requesting Child WS Info Too
    }

    return pt
  }
}

export default Pose

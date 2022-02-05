import { PropertyBinding, AnimationClip, Object3D, Mesh, SkinnedMesh, KeyframeTrack, Bone } from 'three'
import { AnimationManager } from '../../avatar/AnimationManager'
import { LoopAnimationComponent } from '../../avatar/components/LoopAnimationComponent'
import { defineQuery, getComponent } from '../../ecs/functions/ComponentFunctions'
import { Object3DComponent, Object3DWithEntity } from '../components/Object3DComponent'

// Modified version of Don McCurdy's AnimationUtils.clone
// https://github.com/mrdoob/three.js/pull/14494
function parallelTraverse(a: Object3D, b: Object3D, callback: (a: Object3D, b: Object3D) => void): void {
  callback(a, b)
  for (let i = 0; i < a.children.length; i++) {
    parallelTraverse(a.children[i], b.children[i], callback)
  }
}

// Supports the following PropertyBinding path formats:
// uuid.propertyName
// uuid.propertyName[propertyIndex]
// uuid.objectName[objectIndex].propertyName[propertyIndex]
// Does not support property bindings that use object3D names or parent nodes
function cloneKeyframeTrack(sourceKeyframeTrack: KeyframeTrack, cloneUUIDLookup: Map<string, string>): KeyframeTrack {
  const {
    nodeName: uuid,
    objectName,
    objectIndex,
    propertyName,
    propertyIndex
  } = PropertyBinding.parseTrackName(sourceKeyframeTrack.name)

  let path = ''
  if (uuid) {
    const clonedUUID = cloneUUIDLookup.get(uuid)

    if (clonedUUID === undefined) {
      throw new Error(`Error cloning model. Could not find KeyframeTrack target with uuid: "${uuid}"`)
    }

    path += clonedUUID
  }

  if (objectName) path += '.' + objectName
  if (objectIndex) path += '[' + objectIndex + ']'
  if (propertyName) path += '.' + propertyName
  if (propertyIndex) path += '[' + propertyIndex + ']'

  const clonedKeyframeTrack = sourceKeyframeTrack.clone()
  clonedKeyframeTrack.name = path

  return clonedKeyframeTrack
}

function cloneAnimationClip(sourceAnimationClip: AnimationClip, cloneUUIDLookup: Map<string, string>): AnimationClip {
  const clonedTracks = sourceAnimationClip.tracks.map((keyframeTrack) =>
    cloneKeyframeTrack(keyframeTrack, cloneUUIDLookup)
  )
  return new AnimationClip(sourceAnimationClip.name, sourceAnimationClip.duration, clonedTracks)
}

export default function cloneObject3D(source: Object3D, preserveUUIDs?: boolean): Object3DWithEntity {
  const cloneLookup = new Map<Object3D, Object3D>()
  const cloneUUIDLookup = new Map<string, string>()
  const clone = source.clone() as Object3DWithEntity

  parallelTraverse(source, clone, (sourceNode, clonedNode) => {
    cloneLookup.set(sourceNode, clonedNode)
  })

  source.traverse((node: Object3DWithEntity) => {
    const clonedNode = cloneLookup.get(node) as Object3DWithEntity
    if (!clonedNode) throw new Error(`Couldn't find the cloned node for ${node.type} "${node.name}"`)

    if (preserveUUIDs) clonedNode.uuid = node.uuid
    clonedNode.entity = node.entity
    cloneUUIDLookup.set(node.uuid, clonedNode.uuid)
  })

  source.traverse((node) => {
    const clonedNode = cloneLookup.get(node)
    if (!clonedNode) return

    if (node.animations) {
      clonedNode.animations = node.animations.map((animationClip) => cloneAnimationClip(animationClip, cloneUUIDLookup))
    }

    if ((node as Mesh).isMesh && (node as Mesh).geometry.boundsTree) {
      ;(clonedNode as Mesh).geometry.boundsTree = (node as Mesh).geometry.boundsTree
    }

    if ((node as SkinnedMesh).isSkinnedMesh) {
      const sourceBones = (node as SkinnedMesh).skeleton.bones
      ;(clonedNode as SkinnedMesh).skeleton = (node as SkinnedMesh).skeleton.clone()
      ;(clonedNode as SkinnedMesh).skeleton.bones = sourceBones.map((sourceBone) => {
        if (!cloneLookup.has(sourceBone)) throw new Error('Required bones are not descendants of the given object.')
        return cloneLookup.get(sourceBone)
      }) as Bone[]
      ;(clonedNode as SkinnedMesh).bind((clonedNode as SkinnedMesh).skeleton, (node as SkinnedMesh).bindMatrix)
    }
  })

  return clone
}

export const getAnimationClips = (): AnimationClip[] => {
  const loopAnimationQuery = defineQuery([LoopAnimationComponent])
  const result = new Set<AnimationClip>()

  for (let entity of loopAnimationQuery()) {
    const comp = getComponent(entity, LoopAnimationComponent)
    if (comp.activeClipIndex < 0) continue

    if (comp.hasAvatarAnimations) {
      result.add(AnimationManager.instance._animations[comp.activeClipIndex])
    } else {
      const obj3d = getComponent(entity, Object3DComponent).value
      result.add(obj3d.animations[comp.activeClipIndex])
    }
  }

  return Array.from(result)
}

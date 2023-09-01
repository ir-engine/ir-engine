/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { AnimationClip, Bone, KeyframeTrack, Mesh, Object3D, PropertyBinding, SkinnedMesh } from 'three'

import { Object3DWithEntity } from '../components/GroupComponent'

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
      //throw new Error(`Error cloning model. Could not find KeyframeTrack target with uuid: "${uuid}"`)
    } else {
      path += clonedUUID
    }
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
  const clone = source.clone(true) as Object3DWithEntity

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
      // eslint-disable-next-line @typescript-eslint/no-extra-semi
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

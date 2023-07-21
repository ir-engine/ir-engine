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

import { Quaternion, Vector3 } from 'three'

import { Engine } from '../ecs/classes/Engine'
import { defineSystem } from '../ecs/functions/SystemFunctions'
import { ReferenceSpace } from './XRState'

/**
 * XRPersistentAnchorSystem
 *   adapted from https://github.com/mrdoob/three.js/pull/24872/files
 */

type XRFramePersistentAnchorType = Omit<XRFrame, 'session' | 'createAnchor' | 'trackedAnchors'> & {
  detectedPlanes: XRPlaneSet
  lastChangedTime: number
  session: XRSession & {
    restorePersistentAnchor: (uuid: string) => Promise<XRAnchor>
    deletePersistentAnchor: (uuid: string) => Promise<void>
  }
  createAnchor: (pose: XRRigidTransform, space: XRReferenceSpace) => Promise<XRAnchorPersistentType>
  trackedAnchors: Set<XRAnchorPersistentType>
}

type XRAnchorPersistentType = XRAnchor & {
  requestPersistentHandle: () => Promise<string>
}

const createAnchor = async (xrFrame: XRFramePersistentAnchorType, position: Vector3, rotation: Quaternion) => {
  const referenceSpace = ReferenceSpace.origin
  if (xrFrame && referenceSpace) {
    const anchorPose = new XRRigidTransform(position, rotation)
    return await xrFrame.createAnchor?.(anchorPose, referenceSpace)
  } else {
    throw new Error('XRFrame not available.')
  }
}

const createPersistentAnchor = async (
  xrFrame: XRFramePersistentAnchorType,
  position: Vector3,
  rotation: Quaternion
) => {
  const referenceSpace = ReferenceSpace.origin
  if (xrFrame && referenceSpace) {
    const anchorPose = new XRRigidTransform(position, rotation)
    const anchor = await xrFrame.createAnchor(anchorPose, referenceSpace)!
    try {
      const handle = await anchor.requestPersistentHandle()
      return [anchor, handle]
    } catch (e) {
      anchor.delete()
      throw e
    }
  } else {
    throw new Error('XRFrame not available.')
  }
}

const restoreAnchor = async (xrFrame: XRFramePersistentAnchorType, uuid: string) => {
  if (xrFrame?.session) {
    return await xrFrame.session.restorePersistentAnchor(uuid)
  } else {
    throw new Error('XRSession not available.')
  }
}

const deleteAnchor = async (xrFrame: XRFramePersistentAnchorType, uuid: string) => {
  if (xrFrame?.session) {
    await xrFrame.session.deletePersistentAnchor(uuid)
  } else {
    throw new Error('XRSession not available.')
  }
}

const anchors = new Set<XRAnchorPersistentType>()
const anchorPoses = new Map()

export const XRAnchorFunctions = {
  createAnchor,
  createPersistentAnchor,
  restoreAnchor,
  deleteAnchor,
  anchors,
  anchorPoses
}

const execute = () => {
  const frame = Engine.instance.xrFrame as XRFramePersistentAnchorType
  if (!frame) return

  const xrSpace = ReferenceSpace.origin
  if (!xrSpace) return

  if (frame.trackedAnchors) {
    const anchorsToRemove = [] as XRAnchorPersistentType[]

    for (const anchor of anchors) {
      if (!frame.trackedAnchors.has(anchor)) {
        anchorsToRemove.push(anchor)
      }
    }

    if (anchorsToRemove.length) {
      for (const anchor of anchorsToRemove) {
        anchors.delete(anchor)
      }
    }

    for (const anchor of frame.trackedAnchors) {
      if (!anchors.has(anchor)) {
        anchors.add(anchor)
      }
    }

    for (const anchor of anchors) {
      const knownPose = anchorPoses.get(anchor)
      const anchorPose = frame.getPose(anchor.anchorSpace, xrSpace)
      if (anchorPose) {
        if (knownPose === undefined) {
          anchorPoses.set(anchor, anchorPose)
        } else {
          const position = anchorPose.transform.position
          const orientation = anchorPose.transform.orientation

          const knownPosition = knownPose.transform.position
          const knownOrientation = knownPose.transform.orientation

          if (
            position.x !== knownPosition.x ||
            position.y !== knownPosition.y ||
            position.z !== knownPosition.z ||
            orientation.x !== knownOrientation.x ||
            orientation.y !== knownOrientation.y ||
            orientation.z !== knownOrientation.z ||
            orientation.w !== knownOrientation.w
          ) {
            anchorPoses.set(anchor, anchorPose)
          }
        }
      } else {
        if (knownPose !== undefined) {
          // anchor pose changed
        }
      }
    }
  }
}

export const XRPersistentAnchorSystem = defineSystem({
  uuid: 'ee.engine.XRPersistentAnchorSystem',
  execute
})

import { Quaternion, Vector3 } from 'three'

import { getState } from '@etherealengine/hyperflux'

import { Engine } from '../ecs/classes/Engine'
import { World } from '../ecs/classes/World'
import { VPSSystem } from './VPSSystem'
import { ReferenceSpace, XRState } from './XRState'

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

export default async function XRPersistentAnchorSystem(world: World) {
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

  const cleanup = async () => {}

  return { execute, cleanup, subsystems: [() => Promise.resolve({ default: VPSSystem })] }
}

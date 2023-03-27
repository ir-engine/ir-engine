import { Entity } from '../ecs/classes/Entity'
import { hasComponent, setComponent } from '../ecs/functions/ComponentFunctions'
import { checkBitflag, readCompressedRotation, readVector3 } from '../networking/serialization/DataReader'
import { writeCompressedRotation, writeVector3 } from '../networking/serialization/DataWriter'
import { readUint16, rewindViewCursor, spaceUint16, ViewCursor } from '../networking/serialization/ViewCursor'
import {
  AvatarHeadIKComponent,
  AvatarLeftArmIKComponent,
  AvatarRightArmIKComponent
} from './components/AvatarIKComponents'

export const writeXRHeadPosition = writeVector3(AvatarHeadIKComponent.target.position)
export const writeXRHeadRotation = writeCompressedRotation(AvatarHeadIKComponent.target.rotation)

export const writeXRControllerLeftPosition = writeVector3(AvatarLeftArmIKComponent.target.position)
export const writeXRControllerLeftRotation = writeCompressedRotation(AvatarLeftArmIKComponent.target.rotation)

export const writeXRControllerRightPosition = writeVector3(AvatarRightArmIKComponent.target.position)
export const writeXRControllerRightRotation = writeCompressedRotation(AvatarRightArmIKComponent.target.rotation)

export const writeXRHead = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, AvatarHeadIKComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint16(v)
  let changeMask = 0
  let b = 0

  changeMask |= writeXRHeadPosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRHeadRotation(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writeXRLeftHand = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, AvatarLeftArmIKComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint16(v)
  let changeMask = 0
  let b = 0

  changeMask |= writeXRControllerLeftPosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRControllerLeftRotation(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const writeXRRightHand = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, AvatarRightArmIKComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint16(v)
  let changeMask = 0
  let b = 0

  changeMask |= writeXRControllerRightPosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeXRControllerRightRotation(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const readXRHeadPosition = readVector3(AvatarHeadIKComponent.target.position)
export const readXRHeadRotation = readCompressedRotation(AvatarHeadIKComponent.target.rotation)

export const readXRControllerLeftPosition = readVector3(AvatarLeftArmIKComponent.target.position)
export const readXRControllerLeftRotation = readCompressedRotation(AvatarLeftArmIKComponent.target.rotation)

export const readXRControllerRightPosition = readVector3(AvatarRightArmIKComponent.target.position)
export const readXRControllerRightRotation = readCompressedRotation(AvatarRightArmIKComponent.target.rotation)

export const readXRHead = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint16(v)
  let b = 0
  let changed = false
  if (checkBitflag(changeMask, 1 << b++)) {
    readXRHeadPosition(v, entity)
    changed = true
  }
  if (checkBitflag(changeMask, 1 << b++)) {
    readXRHeadRotation(v, entity)
    changed = true
  }
  if (changed && !hasComponent(entity, AvatarHeadIKComponent)) setComponent(entity, AvatarHeadIKComponent)
}

export const readXRLeftHand = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint16(v)
  let b = 0
  let changed = false
  if (checkBitflag(changeMask, 1 << b++)) {
    readXRControllerLeftPosition(v, entity)
    changed = true
  }
  if (checkBitflag(changeMask, 1 << b++)) {
    readXRControllerLeftRotation(v, entity)
    changed = true
  }
  if (changed && !hasComponent(entity, AvatarLeftArmIKComponent)) setComponent(entity, AvatarLeftArmIKComponent)
}

export const readXRRightHand = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint16(v)
  let b = 0
  let changed = false
  if (checkBitflag(changeMask, 1 << b++)) {
    readXRControllerRightPosition(v, entity)
    changed = true
  }
  if (checkBitflag(changeMask, 1 << b++)) {
    readXRControllerRightRotation(v, entity)
    changed = true
  }
  if (changed && !hasComponent(entity, AvatarRightArmIKComponent)) setComponent(entity, AvatarRightArmIKComponent)
}

export const IKSerialization = {
  headID: 'ee.core.xrhead' as const,
  leftHandID: 'ee.core.xrLeftHand' as const,
  rightHandID: 'ee.core.xrRightHand' as const,
  writeXRHead,
  writeXRLeftHand,
  writeXRRightHand,
  readXRHead,
  readXRLeftHand,
  readXRRightHand
}

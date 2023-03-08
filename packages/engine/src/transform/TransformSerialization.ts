import { Engine } from '../ecs/classes/Engine'
import { Entity } from '../ecs/classes/Entity'
import { hasComponent } from '../ecs/functions/ComponentFunctions'
import { checkBitflag, readCompressedRotation, readVector3 } from '../networking/serialization/DataReader'
import { writeCompressedRotation, writeVector3 } from '../networking/serialization/DataWriter'
import { readUint8, rewindViewCursor, spaceUint8, ViewCursor } from '../networking/serialization/ViewCursor'
import { RigidBodyComponent } from '../physics/components/RigidBodyComponent'
import { TransformComponent } from './components/TransformComponent'

export const readPosition = readVector3(TransformComponent.position)
export const readRotation = readCompressedRotation(TransformComponent.rotation) //readVector4(TransformComponent.rotation)

export const readTransform = (v: ViewCursor, entity: Entity) => {
  const changeMask = readUint8(v)
  let b = 0
  if (checkBitflag(changeMask, 1 << b++)) readPosition(v, entity)
  if (checkBitflag(changeMask, 1 << b++)) readRotation(v, entity)
  Engine.instance.dirtyTransforms[entity] = true
}

export const writePosition = writeVector3(TransformComponent.position)
export const writeRotation = writeCompressedRotation(TransformComponent.rotation)

export const writeTransform = (v: ViewCursor, entity: Entity) => {
  if (!hasComponent(entity, TransformComponent) || hasComponent(entity, RigidBodyComponent)) return

  const rewind = rewindViewCursor(v)
  const writeChangeMask = spaceUint8(v)
  let changeMask = 0
  let b = 0

  changeMask |= writePosition(v, entity) ? 1 << b++ : b++ && 0
  changeMask |= writeRotation(v, entity) ? 1 << b++ : b++ && 0

  return (changeMask > 0 && writeChangeMask(changeMask)) || rewind()
}

export const TransformSerialization = {
  readTransform,
  writeTransform
}

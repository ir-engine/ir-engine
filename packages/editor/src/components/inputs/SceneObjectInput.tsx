import React from 'react'
import { DropTargetMonitor, useDrop } from 'react-dnd'

import { Entity } from '@etherealengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { UUIDComponent } from '@etherealengine/engine/src/scene/components/UUIDComponent'

import { ItemTypes } from '../../constants/AssetTypes'
import { ControlledStringInput } from './StringInput'

export function SceneObjectInput({ value, onChange, ...rest }) {
  function onDrop(item, monitor: DropTargetMonitor) {
    const value = item.value
    let element = value as EntityOrObjectUUID | EntityOrObjectUUID[] | undefined
    if (typeof element === 'string' || typeof element === 'undefined') return
    if (Array.isArray(value)) {
      element = element[0]
    }
    onChange(getComponent(element as Entity, UUIDComponent))
  }

  const [{ canDrop, isOver }, dropRef] = useDrop({
    accept: [ItemTypes.Node],
    drop: onDrop,
    collect: (monitor) => ({
      canDrop: monitor.canDrop(),
      isOver: monitor.isOver()
    })
  })

  return (
    <>
      <ControlledStringInput ref={dropRef} onChange={onChange} canDrop={isOver && canDrop} value={value} {...rest} />
    </>
  )
}

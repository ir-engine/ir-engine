import React from 'react'
import { DropTargetMonitor, useDrop } from 'react-dnd'

import { Entity } from '@xrengine/engine/src/ecs/classes/Entity'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { UUIDComponent } from '@xrengine/engine/src/scene/components/UUIDComponent'

import { ItemTypes } from '../../constants/AssetTypes'
import { ControlledStringInput } from './StringInput'

export function SceneObjectInput<
  T extends { value: EntityOrObjectUUID; onChange: (val: EntityOrObjectUUID) => any; [key: string]: any }
>({ value, onChange, ...rest }: T) {
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
      <ControlledStringInput
        ref={dropRef}
        onChange={onChange}
        canDrop={isOver && canDrop}
        value={'' + value}
        {...rest}
      />
    </>
  )
}

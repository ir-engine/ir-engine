import { useHookstate } from '@hookstate/core'
import React from 'react'
import { DropTargetMonitor, useDrop } from 'react-dnd'
import { Object3D } from 'three'

import { EntityTree, EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { useHookEffect } from '@xrengine/hyperflux'

import { ItemTypes } from '../../constants/AssetTypes'
import { ControlledStringInput } from './StringInput'

export function SceneObjectInput({ value, onChange, ...rest }) {
  function onDrop(item, monitor: DropTargetMonitor) {
    const value = item.value
    let element = value as EntityTreeNode | string | (EntityTreeNode | string)[] | undefined
    if (typeof element === 'string' || typeof element === 'undefined') return
    if (Array.isArray(value)) {
      element = element[0]
    }
    onChange((element as EntityTreeNode).uuid)
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

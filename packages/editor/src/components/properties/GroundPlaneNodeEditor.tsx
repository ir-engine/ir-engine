import React, { useState, useCallback } from 'react'
import NodeEditor from './NodeEditor'
import InputGroup from '../inputs/InputGroup'
import ColorInput from '../inputs/ColorInput'
import BooleanInput from '../inputs/BooleanInput'
import { SquareFull } from '@styled-icons/fa-solid/SquareFull'
import i18n from 'i18next'
import { withTranslation } from 'react-i18next'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { GroundPlaneComponent } from '@xrengine/engine/src/scene/components/GroundPlaneComponent'

/**
 * Declaring GroundPlaneNodeEditor properties.
 *
 * @author Robert Long
 * @type {Object}
 */

type GroundPlaneNodeEditorProps = {
  node?: any
  t: Function
}

/**
 * IconComponent is used to render GroundPlaneNode
 *
 * @author Robert Long
 * @type {class component}
 */
export const GroundPlaneNodeEditor = (props: GroundPlaneNodeEditorProps) => {
  const [, updateState] = useState()

  const forceUpdate = useCallback(() => updateState({}), [])

  //function handles the changes in color property
  const onChangeColor = (color) => {
    // CommandManager.instance.setPropertyOnSelection('color', color)
    const groundPlaneComponent = getComponent(props.node.eid, GroundPlaneComponent)
    groundPlaneComponent.color = color
    forceUpdate()
  }

  //function handles the changes for receiveShadow property
  const onChangeReceiveShadow = (receiveShadow) => {
    // CommandManager.instance.setPropertyOnSelection('receiveShadow', receiveShadow)
    const groundPlaneComponent = getComponent(props.node.eid, GroundPlaneComponent)
    groundPlaneComponent.receiveShadow = receiveShadow
    forceUpdate()
  }

  // function handles the changes in walkable property
  const onChangeWalkable = (walkable) => {
    // CommandManager.instance.setPropertyOnSelection('walkable', walkable)
    const groundPlaneComponent = getComponent(props.node.eid, GroundPlaneComponent)
    groundPlaneComponent.walkable = walkable
    forceUpdate()
  }

  const groundPlaneComponent = getComponent(props.node.eid, GroundPlaneComponent)

  return (
    <NodeEditor {...props} description={GroundPlaneNodeEditor.description}>
      <InputGroup name="Color" label={props.t('editor:properties.groundPlane.lbl-color')}>
        <ColorInput value={groundPlaneComponent.color} onChange={onChangeColor} />
      </InputGroup>
      <InputGroup name="Receive Shadow" label={props.t('editor:properties.groundPlane.lbl-receiveShadow')}>
        <BooleanInput value={groundPlaneComponent.receiveShadow} onChange={onChangeReceiveShadow} />
      </InputGroup>
      <InputGroup name="Walkable" label={props.t('editor:properties.groundPlane.lbl-walkable')}>
        <BooleanInput value={groundPlaneComponent.walkable} onChange={onChangeWalkable} />
      </InputGroup>
    </NodeEditor>
  )
}

GroundPlaneNodeEditor.iconComponent = SquareFull
GroundPlaneNodeEditor.description = i18n.t('editor:properties.groundPlane.description')

export default withTranslation()(GroundPlaneNodeEditor)

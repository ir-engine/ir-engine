import React, { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import SquareIcon from '@mui/icons-material/Square'

import { CommandManager } from '../../managers/CommandManager'
import BooleanInput from '../inputs/BooleanInput'
import ColorInput from '../inputs/ColorInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'

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
  const { t } = useTranslation()

  const forceUpdate = useCallback(() => updateState({}), [])

  //function handles the changes in color property
  const onChangeColor = (color) => {
    CommandManager.instance.setPropertyOnSelection('color', color)
    forceUpdate()
  }

  const onChangeGenerateNavmesh = (generateNavmesh) => {
    CommandManager.instance.setPropertyOnSelection('generateNavmesh', generateNavmesh)
    forceUpdate()
  }

  //function handles the changes for receiveShadow property
  const onChangeReceiveShadow = (receiveShadow) => {
    CommandManager.instance.setPropertyOnSelection('receiveShadow', receiveShadow)
    forceUpdate()
  }

  // function handles the changes in walkable property
  const onChangeWalkable = (walkable) => {
    CommandManager.instance.setPropertyOnSelection('walkable', walkable)
    forceUpdate()
  }

  const node = props.node

  return (
    <NodeEditor {...props} description={t('editor:properties.groundPlane.description')}>
      <InputGroup name="Color" label={t('editor:properties.groundPlane.lbl-color')}>
        <ColorInput value={node.color} onChange={onChangeColor} />
      </InputGroup>
      <InputGroup name="Receive Shadow" label={t('editor:properties.groundPlane.lbl-receiveShadow')}>
        <BooleanInput value={node.receiveShadow} onChange={onChangeReceiveShadow} />
      </InputGroup>
      <InputGroup name="Generate Navmesh" label={t('editor:properties.groundPlane.lbl-generateNavmesh')}>
        <BooleanInput value={node.generateNavmesh} onChange={onChangeGenerateNavmesh} />
      </InputGroup>
      <InputGroup name="Walkable" label={t('editor:properties.groundPlane.lbl-walkable')}>
        <BooleanInput value={node.walkable} onChange={onChangeWalkable} />
      </InputGroup>
    </NodeEditor>
  )
}

GroundPlaneNodeEditor.iconComponent = SquareIcon

export default GroundPlaneNodeEditor

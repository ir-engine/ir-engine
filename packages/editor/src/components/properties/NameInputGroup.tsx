import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { getComponent, getOptionalComponent, useComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/functions/EntityTree'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import { Object3DComponent } from '@xrengine/engine/src/scene/components/Object3DComponent'

import { useSelectionState } from '../../services/SelectionServices'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import { EditorComponentType } from './Util'

/**
 * Creating styled component using InputGroup component.
 *
 * @type {Styled Component}
 */
const StyledNameInputGroup = (styled as any)(InputGroup)`
  label {
    width: auto !important;
  }
`

/**
 * NameInputGroup is used to render input group PropertiesPanelContainer.
 *
 * @type {class component}
 */
export const NameInputGroup: EditorComponentType = (props) => {
  const selectionState = useSelectionState()
  const nodeName = useComponent(props.node.entity, NameComponent)

  const [name, setName] = useState(nodeName.value)
  const [focusedNode, setFocusedNode] = useState<EntityTreeNode>()
  const { t } = useTranslation()

  useEffect(() => {
    onObjectChange(selectionState.affectedObjects.value, selectionState.propertyName.value)
  }, [selectionState.objectChangeCounter])

  const onObjectChange = (_: any, propertyName: string) => {
    if (propertyName === 'name') setName(getComponent(props.node.entity, NameComponent))
  }

  //function to handle change in name property
  const updateName = () => {
    nodeName.set(name)

    const obj3d = getOptionalComponent(props.node.entity, Object3DComponent)?.value
    if (obj3d) obj3d.name = name
  }

  //function called when element get focused
  const onFocus = () => {
    setFocusedNode(props.node)
    setName(nodeName.value)
  }

  // function to handle onBlur event on name property
  const onBlurName = () => {
    // Check that the focused node is current node before setting the property.
    // This can happen when clicking on another node in the HierarchyPanel
    if (nodeName.value !== name && props?.node === focusedNode) {
      updateName()
    }

    setFocusedNode(undefined)
  }

  //function to handle keyUp event on name property
  const onKeyUpName = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      updateName()
    }
  }

  return (
    <StyledNameInputGroup name="Name" label={t('editor:properties.name.lbl-name')}>
      <StringInput value={name} onChange={setName} onFocus={onFocus} onBlur={onBlurName} onKeyUp={onKeyUpName} />
    </StyledNameInputGroup>
  )
}

export default NameInputGroup

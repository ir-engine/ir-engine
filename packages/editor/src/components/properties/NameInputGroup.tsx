import React, { useState, useEffect } from 'react'
import InputGroup from '../inputs/InputGroup'
import StringInput from '../inputs/StringInput'
import styled from 'styled-components'
import { useTranslation } from 'react-i18next'
import { CommandManager } from '../../managers/CommandManager'
import { EntityTreeNode } from '@xrengine/engine/src/ecs/classes/EntityTree'
import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { NameComponent } from '@xrengine/engine/src/scene/components/NameComponent'
import EditorEvents from '../../constants/EditorEvents'
import { EditorComponentType } from './Util'

/**
 * Creating styled component using InputGroup component.
 *
 * @author Robert Long
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
 * @author Robert Long
 * @type {class component}
 */
export const NameInputGroup: EditorComponentType = (props) => {
  const nodeName = getComponent(props.node.entity, NameComponent)?.name

  const [name, setName] = useState(nodeName)
  const [focusedNode, setFocusedNode] = useState<EntityTreeNode>()
  const { t } = useTranslation()

  useEffect(() => {
    CommandManager.instance.addListener(EditorEvents.OBJECTS_CHANGED.toString(), onObjectChange)
    return () => {
      CommandManager.instance.removeListener(EditorEvents.OBJECTS_CHANGED.toString(), onObjectChange)
    }
  }, [])

  const onObjectChange = (_: any, propertyName: string) => {
    if (propertyName === 'name') setName(getComponent(props.node.entity, NameComponent).name)
  }

  //function to handle change in name property
  const onUpdateName = (name) => setName(name)

  //function called when element get focused
  const onFocus = () => {
    setFocusedNode(props.node)
    setName(nodeName)
  }

  // function to handle onBlur event on name property
  const onBlurName = () => {
    // Check that the focused node is current node before setting the property.
    // This can happen when clicking on another node in the HierarchyPanel
    if (nodeName !== name && props?.node === focusedNode) {
      CommandManager.instance.setPropertyOnSelectionEntities({
        component: NameComponent,
        properties: { name }
      })
    }

    setFocusedNode(undefined)
  }

  //function to handle keyUp event on name property
  const onKeyUpName = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      CommandManager.instance.setPropertyOnSelectionEntities({
        component: NameComponent,
        properties: { name }
      })
    }
  }

  return (
    <StyledNameInputGroup name="Name" label={t('editor:properties.name.lbl-name')}>
      <StringInput value={name} onChange={onUpdateName} onFocus={onFocus} onBlur={onBlurName} onKeyUp={onKeyUpName} />
    </StyledNameInputGroup>
  )
}

export default NameInputGroup

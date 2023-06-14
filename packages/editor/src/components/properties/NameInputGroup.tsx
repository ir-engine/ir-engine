import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import {
  getComponent,
  getOptionalComponent,
  setComponent,
  useComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { GroupComponent } from '@etherealengine/engine/src/scene/components/GroupComponent'
import { NameComponent } from '@etherealengine/engine/src/scene/components/NameComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'

import { SelectionState } from '../../services/SelectionServices'
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
  const selectionState = useHookstate(getMutableState(SelectionState))
  const nodeName = useComponent(props.entity, NameComponent)

  // temp name is used to store the name of the entity, which is then updated upon onBlur event
  const [tempName, setTempName] = useState(nodeName.value)
  const [focusedNode, setFocusedNode] = useState<EntityOrObjectUUID>()
  const { t } = useTranslation()

  useEffect(() => {
    onObjectChange(selectionState.propertyName.value)
  }, [selectionState.objectChangeCounter])

  const onObjectChange = (propertyName: string) => {
    if (propertyName === 'name') setTempName(getComponent(props.entity, NameComponent))
  }

  //function to handle change in name property
  const updateName = () => {
    setComponent(props.entity, NameComponent, tempName)

    const group = getOptionalComponent(props.entity, GroupComponent)
    if (group) for (const obj3d of group) obj3d.name = tempName
  }

  //function called when element get focused
  const onFocus = () => {
    setFocusedNode(props.entity)
    setTempName(nodeName.value)
  }

  // function to handle onBlur event on name property
  const onBlurName = () => {
    // Check that the focused node is current node before setting the property.
    // This can happen when clicking on another node in the HierarchyPanel
    if (nodeName.value !== tempName && props.entity === focusedNode) {
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
      <StringInput
        value={tempName}
        onChange={setTempName}
        onFocus={onFocus}
        onBlur={onBlurName}
        onKeyUp={onKeyUpName}
      />
    </StyledNameInputGroup>
  )
}

export default NameInputGroup

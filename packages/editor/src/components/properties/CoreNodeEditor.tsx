/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import React from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import {
  ComponentJSONIDMap,
  ComponentMap,
  hasComponent,
  setComponent,
  useOptionalComponent
} from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EntityOrObjectUUID, getEntityNodeArrayFromEntities } from '@etherealengine/engine/src/ecs/functions/EntityTree'
import { SceneTagComponent } from '@etherealengine/engine/src/scene/components/SceneTagComponent'
import { VisibleComponent } from '@etherealengine/engine/src/scene/components/VisibleComponent'
import { dispatchAction, getMutableState, useHookstate } from '@etherealengine/hyperflux'

import AddIcon from '@mui/icons-material/Add'

import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { EntityNodeEditor } from '../../functions/PrefabEditors'
import { EditorState } from '../../services/EditorServices'
import { SelectionAction, SelectionState } from '../../services/SelectionServices'
import MainMenu from '../dropDownMenu'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import NameInputGroup from './NameInputGroup'
import { EditorComponentType } from './Util'

/**
 * PropertiesHeader used as a wrapper for NameInputGroupContainer component.
 */
const PropertiesHeader = styled.div`
  border: none !important;
  padding-bottom: 0 !important;
`

/**
 * NameInputGroupContainer used to provides styles and contains NameInputGroup and VisibleInputGroup.
 *
 *  @type {Styled Component}
 */
const NameInputGroupContainer = styled.div``
/**
 * Styled component used to provide styles for visiblity checkbox.
 */
const VisibleInputGroup = styled(InputGroup)`
  & > label {
    width: auto !important;
  }
`

/**
 * CoreNodeEditor component is used to render editor view to customize properties.
 *
 * @type {class component}
 */
export const CoreNodeEditor: EditorComponentType = (props) => {
  const { t } = useTranslation()
  const editorState = useHookstate(getMutableState(EditorState))

  useOptionalComponent(props.entity, VisibleComponent)

  const onChangeVisible = (value) => {
    const nodes = getEntityNodeArrayFromEntities(getMutableState(SelectionState).selectedEntities.value).filter(
      (n) => typeof n !== 'string'
    ) as EntityOrObjectUUID[]
    EditorControlFunctions.addOrRemoveComponent(nodes, VisibleComponent, value)
  }

  const registeredComponents = Array.from(ComponentJSONIDMap.entries())

  return (
    <PropertiesHeader>
      <NameInputGroupContainer>
        <NameInputGroup entity={props.entity} key={props.entity} />
        {!hasComponent(props.entity, SceneTagComponent) && (
          <>
            <VisibleInputGroup name="Visible" label={t('editor:properties.lbl-visible')}>
              <BooleanInput value={hasComponent(props.entity, VisibleComponent)} onChange={onChangeVisible} />
            </VisibleInputGroup>
          </>
        )}
      </NameInputGroupContainer>

      {/** @todo #7258 */}
      {editorState.advancedMode.value && typeof props.entity === 'number' && (
        <div style={{ pointerEvents: 'auto' }}>
          <MainMenu
            icon={AddIcon}
            commands={Array.from(EntityNodeEditor).map(([component, editor]) => ({
              name: component.name,
              action: () => {
                if (!ComponentMap.get(component.name)) return console.warn('could not find component', component.name)
                setComponent(props.entity, ComponentMap.get(component.name)!)
                dispatchAction(SelectionAction.forceUpdate({}))
              }
            }))}
          />
        </div>
      )}
    </PropertiesHeader>
  )
}

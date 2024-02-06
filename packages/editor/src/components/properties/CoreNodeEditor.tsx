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

import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { hasComponent, useOptionalComponent } from '@etherealengine/ecs/src/ComponentFunctions'
import { SceneTagComponent } from '@etherealengine/engine/src/scene/components/SceneTagComponent'
import { getMutableState, useHookstate } from '@etherealengine/hyperflux'
import { VisibleComponent } from '@etherealengine/spatial/src/renderer/components/VisibleComponent'

import { EntityUUID } from '@etherealengine/common/src/interfaces/EntityUUID'
import { Entity } from '@etherealengine/ecs'
import LockIcon from '@mui/icons-material/Lock'
import UnlockIcon from '@mui/icons-material/LockOpen'
import { EditorControlFunctions } from '../../functions/EditorControlFunctions'
import { EditorState } from '../../services/EditorServices'
import { SelectionState } from '../../services/SelectionServices'
import BooleanInput from '../inputs/BooleanInput'
import InputGroup from '../inputs/InputGroup'
import { PanelIcon } from '../layout/Panel'
import { ConvertOldCollider } from './ConvertOldCollider'
import NameInputGroup from './NameInputGroup'
import TransformPropertyGroup from './TransformPropertyGroup'

const propertiesHeaderStyle = {
  border: 'none !important',
  paddingBottom: '0 !important'
}

const nameInputGroupContainerStyle = {}

const visibleInputGroupStyle = {
  '& > label': {
    width: 'auto !important'
  }
}

export const CoreNodeEditor = (props: { entity: Entity }) => {
  const { t } = useTranslation()
  const editorState = useHookstate(getMutableState(EditorState))

  useOptionalComponent(props.entity, VisibleComponent)
  const [locked, setLocked] = useState(editorState.lockPropertiesPanel.value !== '')
  const [visible, setVisible] = useState(hasComponent(props.entity, VisibleComponent))

  useEffect(() => {
    const entities = getMutableState(SelectionState).selectedEntities.value
    const currentEntity = entities[0]
    const currentState = editorState.lockPropertiesPanel.value
    if (!locked) {
      if (currentState) {
        getMutableState(EditorState).lockPropertiesPanel.set('' as EntityUUID)
      }
    } else {
      if (currentEntity) {
        getMutableState(EditorState).lockPropertiesPanel.set(currentEntity)
      }
    }
  }, [locked])

  useEffect(() => {
    const entities = SelectionState.getSelectedEntities()
    EditorControlFunctions.addOrRemoveComponent(entities, VisibleComponent, visible)
  }, [visible])

  return (
    <div style={propertiesHeaderStyle}>
      <div
        style={{
          paddingRight: '1px',
          display: 'flex',
          justifyContent: 'flex-end'
        }}
      >
        <button
          onClick={() => {
            setLocked(!locked)
          }}
          style={{
            background: 'none',
            border: 'none',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <PanelIcon as={editorState.lockPropertiesPanel.value !== '' ? LockIcon : UnlockIcon} size={20} />
        </button>
      </div>
      <div style={nameInputGroupContainerStyle}>
        <NameInputGroup entity={props.entity} />
        <ConvertOldCollider entity={props.entity} />
        {!hasComponent(props.entity, SceneTagComponent) && (
          <>
            <InputGroup
              name="Visible"
              label={t('editor:properties.lbl-visible')}
              {...{ style: { visibleInputGroupStyle } }}
            >
              <BooleanInput value={hasComponent(props.entity, VisibleComponent)} onChange={setVisible} />
            </InputGroup>
          </>
        )}
        <TransformPropertyGroup entity={props.entity} />
      </div>
    </div>
  )
}

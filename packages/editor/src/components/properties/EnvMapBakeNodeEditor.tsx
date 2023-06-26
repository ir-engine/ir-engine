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
import styled from 'styled-components'

import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EnvMapBakeComponent } from '@etherealengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapBakeTypes } from '@etherealengine/engine/src/scene/types/EnvMapBakeTypes'

import SportsGolfIcon from '@mui/icons-material/SportsGolf'

import { uploadBPCEMBakeToServer } from '../../functions/uploadEnvMapBake'
import { PropertiesPanelButton } from '../inputs/Button'
import { EnvMapBakeProperties } from './EnvMapBakeProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

export const enum BakePropertyTypes {
  'Boolean',
  'BakeType',
  'RefreshMode',
  'Resolution',
  'Vector'
}

const TitleLabel = (styled as any).div`
  display: flex;
  flex-direction: row;
  align-items: left;
  font-weight: bold;
  color: var(--textColor);
  padding: 0 8px 8px;
  :last-child {
    margin-left: auto;
  }
`

const DefaultEnvMapBakeSettings = [
  {
    label: 'Bake Settings',
    options: [
      {
        label: 'Type',
        propertyName: 'bakeType',
        type: BakePropertyTypes.BakeType
      },
      {
        label: 'Position Offset',
        propertyName: 'bakePositionOffset',
        type: BakePropertyTypes.Vector
      },
      {
        label: 'Scale',
        propertyName: 'bakeScale',
        type: BakePropertyTypes.Vector
      }
    ]
  },
  {
    label: 'Realtime Settings',
    options: [
      {
        label: 'Refresh Mode',
        propertyName: 'refreshMode',
        type: BakePropertyTypes.RefreshMode
      }
    ]
  },

  {
    label: 'Settings',
    options: [
      {
        label: 'Box Projection',
        propertyName: 'boxProjection',
        type: BakePropertyTypes.Boolean
      }
    ]
  },
  {
    label: 'Capture Settings',
    options: [
      {
        label: 'Resolution',
        propertyName: 'resolution',
        type: BakePropertyTypes.Resolution
      }
    ]
  }
]

export const EnvMapBakeNodeEditor: EditorComponentType = (props) => {
  const renderEnvMapBakeProperties = () => {
    const bakeComponent = getComponent(props.entity, EnvMapBakeComponent)

    const renderedProperty = DefaultEnvMapBakeSettings.map((element, id) => {
      if (element.label == 'Realtime Settings' && bakeComponent.bakeType == EnvMapBakeTypes.Realtime) {
        return <div key={id + 'Realtime'} />
      }

      const renderProp = element.label ? [<TitleLabel key={id + 'title'}>{element.label}</TitleLabel>] : []

      element.options?.forEach((property, propertyid) => {
        renderProp.push(
          <EnvMapBakeProperties
            key={id + '' + propertyid}
            element={property}
            bakeComponent={bakeComponent}
            entity={props.entity}
          />
        )
      })

      renderProp.push(<br key={id + 'break'} />)
      return renderProp
    })

    return renderedProperty
  }

  return (
    <NodeEditor {...props} name="EnvMap Bake" description="For Adding EnvMap bake in your scene">
      {renderEnvMapBakeProperties()}
      <PropertiesPanelButton onClick={() => uploadBPCEMBakeToServer(props.entity)}>Bake</PropertiesPanelButton>
    </NodeEditor>
  )
}

EnvMapBakeNodeEditor.iconComponent = SportsGolfIcon
export default EnvMapBakeNodeEditor

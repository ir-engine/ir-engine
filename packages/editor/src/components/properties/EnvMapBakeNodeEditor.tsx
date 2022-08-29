import React from 'react'
import styled from 'styled-components'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { EnvMapBakeComponent } from '@xrengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapBakeTypes } from '@xrengine/engine/src/scene/types/EnvMapBakeTypes'

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
    const bakeComponent = getComponent(props.node.entity, EnvMapBakeComponent)

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
            node={props.node}
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
      <PropertiesPanelButton onClick={() => uploadBPCEMBakeToServer(props.node.entity)}>Bake</PropertiesPanelButton>
    </NodeEditor>
  )
}

EnvMapBakeNodeEditor.iconComponent = SportsGolfIcon
export default EnvMapBakeNodeEditor

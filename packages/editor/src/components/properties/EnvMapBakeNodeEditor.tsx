import React from 'react'
import styled from 'styled-components'

import { getComponent } from '@etherealengine/engine/src/ecs/functions/ComponentFunctions'
import { EnvMapBakeComponent } from '@etherealengine/engine/src/scene/components/EnvMapBakeComponent'
import { EnvMapBakeTypes } from '@etherealengine/engine/src/scene/types/EnvMapBakeTypes'
import { dispatchAction } from '@etherealengine/hyperflux'

import SportsGolfIcon from '@mui/icons-material/SportsGolf'

import { uploadBPCEMBakeToServer } from '../../functions/uploadEnvMapBake'
import { EditorHistoryAction } from '../../services/EditorHistory'
import { EditorAction } from '../../services/EditorServices'
import BooleanInput from '../inputs/BooleanInput'
import { PropertiesPanelButton } from '../inputs/Button'
import InputGroup from '../inputs/InputGroup'
import SelectInput from '../inputs/SelectInput'
import Vector3Input from '../inputs/Vector3Input'
import { EnvMapBakeProperties } from './EnvMapBakeProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType, updateProperty } from './Util'

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

const bakeResolutionTypes = [256, 512, 1024, 2048]

export const EnvMapBakeNodeEditor: EditorComponentType = (props) => {
  const bakeComponent = getComponent(props.entity, EnvMapBakeComponent)
  const renderEnvMapBakeProperties = () => {
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

  const onChangePosition = (value) => {
    bakeComponent.bakePositionOffset.copy(value)
  }
  const onChangeScale = (value) => {
    bakeComponent.bakeScale.copy(value)
  }

  return (
    <NodeEditor {...props} name="EnvMap Bake" description="For Adding EnvMap bake in your scene">
      <PropertiesPanelButton onClick={() => uploadBPCEMBakeToServer(props.entity)}>Bake</PropertiesPanelButton>
      <InputGroup name="Position" label="Position Offset">
        <Vector3Input value={bakeComponent.bakePositionOffset} onChange={onChangePosition} />
      </InputGroup>
      <InputGroup name="Scale" label="Scale">
        <Vector3Input value={bakeComponent.bakeScale} onChange={onChangeScale} />
      </InputGroup>
      <InputGroup name="Type" label="Bake Type">
        <SelectInput
          options={[
            { label: 'Baked', value: 'Baked' },
            { label: 'Realtime', value: 'Realtime' }
          ]}
          key={props.entity}
          value={bakeComponent.bakeType}
          onChange={updateProperty(EnvMapBakeComponent, 'bakeType')}
        />
      </InputGroup>
      <InputGroup name="Bake Resolution" label="Bake Resolution">
        <SelectInput
          options={bakeResolutionTypes.map((resolution) => ({ label: resolution.toString(), value: resolution }))}
          key={props.entity}
          value={bakeComponent.resolution}
          onChange={updateProperty(EnvMapBakeComponent, 'bakeType')}
        />
      </InputGroup>
      <InputGroup name="Box Projection" label="Box Projection">
        <BooleanInput
          value={bakeComponent.boxProjection}
          onChange={updateProperty(EnvMapBakeComponent, 'boxProjection')}
        />
      </InputGroup>
    </NodeEditor>
  )
}

EnvMapBakeNodeEditor.iconComponent = SportsGolfIcon
export default EnvMapBakeNodeEditor

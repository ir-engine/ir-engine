/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */
import React from 'react'
import styled from 'styled-components'

import { getComponent } from '@xrengine/engine/src/ecs/functions/ComponentFunctions'
import { CubemapBakeComponent } from '@xrengine/engine/src/scene/components/CubemapBakeComponent'
import { CubemapBakeTypes } from '@xrengine/engine/src/scene/types/CubemapBakeTypes'

import SportsGolfIcon from '@mui/icons-material/SportsGolf'

import { uploadBakeToServer } from '../../functions/uploadCubemapBake'
import { PropertiesPanelButton } from '../inputs/Button'
import { CubemapBakeProperties } from './CubemapBakeProperties'
import NodeEditor from './NodeEditor'
import { EditorComponentType } from './Util'

export const enum BakePropertyTypes {
  'Boolean',
  'CubemapBakeType',
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

const DefaultCubemapBakeSettings = [
  {
    label: 'Cubemap bake Settings',
    options: [
      {
        label: 'Position Offset',
        propertyName: 'bakePositionOffset',
        type: BakePropertyTypes.Vector
      },
      {
        label: 'Scale',
        propertyName: 'bakeScale',
        type: BakePropertyTypes.Vector
      },
      {
        label: 'Cubemap bake Type',
        propertyName: 'bakeType',
        type: BakePropertyTypes.CubemapBakeType
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

export const CubemapBakeNodeEditor: EditorComponentType = (props) => {
  const renderCubemapBakeProperties = () => {
    const bakeComponent = getComponent(props.node.entity, CubemapBakeComponent)

    const renderedProperty = DefaultCubemapBakeSettings.map((element, id) => {
      if (element.label == 'Realtime Settings' && bakeComponent.options.bakeType == CubemapBakeTypes.Realtime) {
        return <div key={id + 'Realtime'} />
      }

      const renderProp = element.label ? [<TitleLabel key={id + 'title'}>{element.label}</TitleLabel>] : []

      element.options?.forEach((property, propertyid) => {
        renderProp.push(
          <CubemapBakeProperties key={id + '' + propertyid} element={property} bakeComponent={bakeComponent} />
        )
      })

      renderProp.push(<br key={id + 'break'} />)
      return renderProp
    })

    return renderedProperty
  }

  return (
    <NodeEditor {...props} name="Cubemap Bake" description="For Adding Cubemap bake in your scene">
      {renderCubemapBakeProperties()}
      <PropertiesPanelButton onClick={() => uploadBakeToServer(props.node.entity)}>Bake</PropertiesPanelButton>
    </NodeEditor>
  )
}

CubemapBakeNodeEditor.iconComponent = SportsGolfIcon
export default CubemapBakeNodeEditor

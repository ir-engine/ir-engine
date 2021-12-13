/**
 * @author Abhishek Pathak <abhi.pathak401@gmail.com>
 */

import React from 'react'
import { Vector3 } from 'three'
import { MediumButton } from '../inputs/Button'
import { CubemapBakeProperties } from './CubemapBakeProperties'
import SportsGolfIcon from '@mui/icons-material/SportsGolf'

export const enum BakePropertyTypes {
  'Boolean',
  'CubemapBakeType',
  'RefreshMode',
  'Resolution',
  'Vector'
}

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

export type CubemapBakeNodeEditorProps = {
  node?: object
}

export const CubemapBakeNodeEditor = (props: CubemapBakeNodeEditorProps) => {
  const renderCubemapBakeProperties = () => {
    const renderedProperty = DefaultCubemapBakeSettings.map((element, id) => {
      if ((props.node as any).cubemapBakeSettings.bakeType == 1 && element.label == 'Realtime Settings') {
        return <div key={id + 'Realtime'} />
      }
      const renderProp = element.label ? [<div key={id + 'title'}>{element.label}</div>] : []
      element?.options?.forEach((property, propertyid) => {
        renderProp.push(<CubemapBakeProperties key={id + '' + propertyid} element={property} {...props} />)
      })
      renderProp.push(<br key={id + 'break'} />)
      return renderProp
    })
    return <>{renderedProperty}</>
  }

  return (
    <div>
      {renderCubemapBakeProperties()}
      {/* <MediumButton onClick={(props.node as any).Bake}>Bake</MediumButton> */}
    </div>
  )
}

CubemapBakeNodeEditor.iconComponent = SportsGolfIcon
CubemapBakeNodeEditor.description = 'For Adding Cubemap bake in your scene'
export default CubemapBakeNodeEditor

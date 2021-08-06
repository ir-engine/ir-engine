import { Rainbow } from '@styled-icons/fa-solid/Rainbow'
import React, { Component } from 'react'
import SelectInput from '../inputs/SelectInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'
import { NumericInputGroup } from '../inputs/NumericInputGroup'

/**
 * [propTypes Defining properties for CameraProperties component]
 * @type {Object}
 */
type CamerarPropertiesNodeEditorPropTypes = {
  editor?: object
  node?: object
}

export enum CameraPropertyTypes {
  cameraMode,
  projectionType,
  fov,

}

/** Types copied from Camera Modes of engine. */
const cameraModeSelect = [
  {
    label: 'First Person',
    value: 0
  },
  {
    label: 'Shoulder Cam',
    value: 1
  },
  {
    label: 'Third Person',
    value: 2
  },
  {
    label: 'Top Down',
    value: 3
  }
]

/** Types copied from Camera Modes of engine. */
const projectionTypeSelect = [
  {
    label: 'Perspective',
    value: 0
  },
  {
    label: 'Orthographic',
    value: 1
  }
]

interface Props {
  node?: any,
  value?: any
  onChangeFunction?: any
  op?: any
  getProp?: any
}

/**
 * @author Hamza Musthaq <hamzamushtaq34@hotmail.com>
 */
export const CameraProperties = (props: Props) => {
  const { value, node, op, onChangeFunction, getProp } = props
  const onPropertyValueChanged = (event) => {
    let address = ''
    op.forEach((element, id) => {
      if (id < op.length - 1) address += element + '.'
      else address += element
    })
    {
      /* @ts-ignore */
    }
    onChangeFunction(address, event)
  }

  const getPropertyValue = () => {
    const val = getProp(op)
    return val
  }

  {
    /* @ts-ignore */
  }
  if (value.keys === '') return <></>

  let renderVal = <></>
  {
    /* @ts-ignore */
  }

  switch (value.propertyType) {
    case CameraPropertyTypes.cameraMode:
      renderVal = (
        <>
          {/* @ts-ignore */}
          <SelectInput options={cameraModeSelect} onChange={onPropertyValueChanged} value={getPropertyValue()} />
        </>
      )
      break
    case CameraPropertyTypes.projectionType:
      renderVal = (
        <>
          {/* @ts-ignore */}
          <SelectInput options={projectionTypeSelect} onChange={onPropertyValueChanged} value={getPropertyValue()} />
        </>
      )
      break
      case CameraPropertyTypes.fov:
        renderVal = (
          <>
          {/*ts-ignore*/}
            <NumericInputGroup
              name="Field Of View"
              // label={t('editor:properties.directionalLight.lbl-intensity')}
              min={1}
              max={180}
              smallStep={0.001}
              mediumStep={0.01}
              largeStep={0.1}
              value={getPropertyValue()}
              onChange={onPropertyValueChanged}
              unit="cd"
            />
          </>
        )
        break
    default:
      renderVal = <>Can't Determine type of property</>
  }

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      {/* @ts-ignore */}
      <InputGroup name={value.name} label={value.name}>
        {renderVal}
      </InputGroup>
    </div>
  )
}

const CameraOptions = {
  cameraMode: {
    cameraMode: {
      propertyType: CameraPropertyTypes.cameraMode,
      name: 'Camera Mode'
    }
  },
  projectionType: {
    propertyType: CameraPropertyTypes.projectionType,
    name: 'Projection Type'
  },
  fov: {
    propertyType: CameraPropertyTypes.fov,
    name: 'Field Of View'
  }
}

/**
 * @author Hamza Musthaq <hamzamushtaq34@hotmail.com>
 */
export const CameraPropertiesNodeEditor = (props: CamerarPropertiesNodeEditorPropTypes) => {
  const onChangeNodeSetting = (key, op) => {
    const val = props.editor as any
      ; (props.editor as any).setObjectProperty('cameraOptions.' + key, op)
  }

  const getPropertyValue = (arr: []) => {
    return (props.node as any).getPropertyValue(arr)
  }

  const cameraPropertiesTypes = (id, node) => {
    const cameraOptions = CameraOptions[id]
    const item = Object.values(cameraOptions).map((value, index) => {
      const op = [id, Object.keys(cameraOptions)[index]]
      return (
        <CameraProperties
          key={id + index}
          value={value}
          op={op}
          node={node}
          onChangeFunction={onChangeNodeSetting}
          getProp={getPropertyValue}
        />
      )
    })
    return <>{item}</>
  }

  const cameraProperties = (node) => {
    const items = Object.keys(CameraOptions).map((key) => {
      return (
        <div key={key}>
          {key}
          {<div>{cameraPropertiesTypes(key, node)}</div>}
        </div>
      )
    })
    return <div>{items}</div>
  }

  const node = props.node
  return (
    <NodeEditor description={CameraPropertiesNodeEditor.description} {...props}>
      {cameraProperties(node)}
      {/* @ts-ignore */}
    </NodeEditor>
  )
}
CameraPropertiesNodeEditor.iconComponent = Rainbow
CameraPropertiesNodeEditor.description = 'For changing scene camera properties'
export default CameraPropertiesNodeEditor

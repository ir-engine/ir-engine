import { Rainbow } from '@styled-icons/fa-solid/Rainbow'
import React, { Component } from 'react'
import SelectInput from '../inputs/SelectInput'
import InputGroup from '../inputs/InputGroup'
import NodeEditor from './NodeEditor'

/**
 * [propTypes Defining properties for CameraProperties component]
 * @type {Object}
 */
type CamerarPropertiesNodeEditorPropTypes = {
  editor?: object
  node?: object
}

export enum CameraPropertyTypes {
  CameraType
}

/** Types copied from Camera Modes of engine. */
const CameraTypeSelect = [
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
  },
  {
    label: 'Isometric',
    value: 4
  }
]

interface Props {
  value?: any
  onChangeFunction?: any
  op?: any
  getProp?: any
}

/**
 * @author Hamza Musthaq <hamzamushtaq34@hotmail.com>
 */
export const CameraProperties = (props: Props) => {
  const { value, op, onChangeFunction, getProp } = props
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
    case CameraPropertyTypes.CameraType:
      renderVal = (
        <>
          {/* @ts-ignore */}
          <SelectInput options={CameraTypeSelect} onChange={onPropertyValueChanged} value={getPropertyValue()} />
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
  CameraType: {
    CameraMode: {
      propertyType: CameraPropertyTypes.CameraType,
      name: 'Camera Type'
    }
  }
}

/**
 * @author Hamza Musthaq <hamzamushtaq34@hotmail.com>
 */
export const CameraPropertiesNodeEditor = (props: CamerarPropertiesNodeEditorPropTypes) => {
  const onChangeNodeSetting = (key, op) => {
    const val = props.editor as any
    ;(props.editor as any).setObjectProperty('cameraOptions.' + key, op)
  }

  const getPropertyValue = (arr: []) => {
    return (props.node as any).getPropertyValue(arr)
  }

  const cameraPropertiesTypes = (id) => {
    const cameraOptions = CameraOptions[id]
    const item = Object.values(cameraOptions).map((value, index) => {
      const op = [id, Object.keys(cameraOptions)[index]]
      return (
        <CameraProperties
          key={id + index}
          value={value}
          op={op}
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
          {<div>{cameraPropertiesTypes(key)}</div>}
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

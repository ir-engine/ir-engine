import React, { useState } from 'react'
import NumericInput from './NumericInput'
import Scrubber from './Scrubber'
import { Vector3 } from 'three'
import styled from 'styled-components'
import { Link } from '@styled-icons/fa-solid/Link'
import { Unlink } from '@styled-icons/fa-solid/Unlink'
import Hidden from '../layout/Hidden'

export const Vector3InputContainer = (styled as any).div`
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  width: 70%;
  justify-content: flex-start;
`

export const Vector3Scrubber = (styled as any)(Scrubber)`
  display: flex;
  align-items: center;
  padding: 0 8px;
  color: ${(props) => props.theme.text2};
`

const UniformButtonContainer = (styled as any).div`
  display: flex;
  align-items: center;

  svg {
    width: 12px;
  }

  label {
    color: ${(props) => props.theme.text2};
  }

  label:hover {
    color: ${(props) => props.theme.blueHover};
  }
`

let uniqueId = 0

interface Vector3InputProp {
  uniformScaling?: boolean
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  value: any
  onChange: Function
  hideLabels?: boolean
}

interface Vector3InputState {
  uniformEnabled: any
  hideLabels: boolean
}

/**
 *
 * @author Robert Long
 */
const Vector3Input = (props: Vector3InputProp) => {
  const id = uniqueId++
  let newValue = new Vector3()
  let [uniformEnabled, SetUniformEnabled] = useState(props.uniformScaling)
  let [hideLabels, SetHideLabels] = useState(props.hideLabels ?? false)

  const onToggleUniform = () => {
    SetUniformEnabled(!uniformEnabled)
  }

  const onChange = (field, fieldValue) => {
    const { value, onChange } = props

    if (uniformEnabled) {
      newValue.set(fieldValue, fieldValue, fieldValue)
    } else {
      const x = value ? value.x : 0
      const y = value ? value.y : 0
      const z = value ? value.z : 0

      newValue.x = field === 'x' ? fieldValue : x
      newValue.y = field === 'y' ? fieldValue : y
      newValue.z = field === 'z' ? fieldValue : z
    }

    if (typeof onChange === 'function') {
      onChange(newValue)
    }
  }

  const onChangeX = (x) => onChange('x', x)

  const onChangeY = (y) => onChange('y', y)

  const onChangeZ = (z) => onChange('z', z)

  const { uniformScaling, value, ...rest } = props
  const vx = value ? value.x : 0
  const vy = value ? value.y : 0
  const vz = value ? value.z : 0
  const checkboxId = 'uniform-button-' + id

  return (
    <Vector3InputContainer>
      {uniformScaling && (
        <UniformButtonContainer>
          <Hidden as="input" id={checkboxId} type="checkbox" checked={uniformEnabled} onChange={onToggleUniform} />
          <label title="Uniform Scale" htmlFor={checkboxId}>
            {uniformEnabled ? <Link /> : <Unlink />}
          </label>
        </UniformButtonContainer>
      )}
      <Vector3Scrubber {...rest} tag="div" value={vx} onChange={onChangeX}>
        {!hideLabels && <div>X:</div>}
      </Vector3Scrubber>
      <NumericInput {...rest} value={vx} onChange={onChangeX} />
      <Vector3Scrubber {...rest} tag="div" value={vy} onChange={onChangeY}>
        {!hideLabels && <div>Y:</div>}
      </Vector3Scrubber>
      <NumericInput {...rest} value={vy} onChange={onChangeY} />
      <Vector3Scrubber {...rest} tag="div" value={vz} onChange={onChangeZ}>
        {!hideLabels && <div>Z:</div>}
      </Vector3Scrubber>
      <NumericInput {...rest} value={vz} onChange={onChangeZ} />
    </Vector3InputContainer>
  )
}

Vector3Input.defaultProps = {
  value: new Vector3(),
  hideLabels: false,
  onChange: () => {}
}

export default Vector3Input

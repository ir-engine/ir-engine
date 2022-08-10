import React, { useState } from 'react'
import { Vector2 } from 'three'

import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'

import Hidden from '../layout/Hidden'
import NumericInput from './NumericInput'
import { UniformButtonContainer, Vector3InputContainer, Vector3Scrubber } from './Vector3Input'

let uniqueId = 0

interface Vector2InputProp {
  value?: any
  onChange?: Function
  uniformScaling?: boolean
  hideLabels?: boolean
}

export const Vector2Input = ({ value, onChange, uniformScaling, hideLabels, ...rest }: Vector2InputProp) => {
  const id = uniqueId++
  const newValue = new Vector2()
  const [uniformEnabled, setUniformEnabled] = useState(uniformScaling)

  const onToggleUniform = () => {
    setUniformEnabled(!uniformEnabled)
  }

  const processChange = (field, fieldValue) => {
    if (uniformEnabled) {
      newValue.set(fieldValue, fieldValue)
    } else {
      const x = value ? value.x : 0
      const y = value ? value.y : 0

      newValue.x = field === 'x' ? fieldValue : x
      newValue.y = field === 'y' ? fieldValue : y
    }

    if (typeof onChange === 'function') {
      onChange(newValue)
    }
  }

  const onChangeX = (x) => processChange('x', x)

  const onChangeY = (y) => processChange('y', y)

  const vx = value ? value.x : 0
  const vy = value ? value.y : 0
  const checkboxId = 'uniform-button-' + id

  return (
    <Vector3InputContainer>
      <NumericInput
        {...rest}
        value={vx}
        onChange={onChangeX}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} tag="div" value={vx} onChange={onChangeX} axis="x">
              X
            </Vector3Scrubber>
          )
        }
      />
      <NumericInput
        {...rest}
        value={vy}
        onChange={onChangeY}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} tag="div" value={vy} onChange={onChangeY} axis="y">
              Y
            </Vector3Scrubber>
          )
        }
      />
      {uniformScaling && (
        <UniformButtonContainer>
          <Hidden as="input" id={checkboxId} type="checkbox" checked={uniformEnabled} onChange={onToggleUniform} />
          <label title="Uniform Scale" htmlFor={checkboxId}>
            {uniformEnabled ? <LinkIcon /> : <LinkOffIcon />}
          </label>
        </UniformButtonContainer>
      )}
    </Vector3InputContainer>
  )
}

Vector2Input.defaultProps = {
  value: new Vector2(),
  onChange: () => {}
}

export default Vector2Input

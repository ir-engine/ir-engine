import React, { useState } from 'react'
import styled from 'styled-components'
import { Vector3 } from 'three'

import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'

import Hidden from '../layout/Hidden'
import NumericInput from './NumericInput'
import Scrubber from './Scrubber'

export const Vector3InputContainer = (styled as any).div`
  position: relative;
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  justify-content: flex-start;
  gap: 6px;
`

export const Vector3Scrubber = (styled as any)(Scrubber)`
  display: flex;
  align-items: center;
  color: var(--textColor);
  padding: 4px;
  background: ${(props) => (props.axis === 'x' ? 'var(--red)' : props.axis === 'y' ? 'var(--green)' : 'var(--blue)')};
`

export const UniformButtonContainer = (styled as any).div`
  top: 0;
  display: flex;
  align-items: center;
  width: 18px;

  svg {
    width: 100%;
  }

  label {
    color: var(--textColor);
  }

  label:hover {
    color: var(--blueHover);
  }
`

let uniqueId = 0

interface Vector3InputProp {
  uniformScaling?: boolean
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  value: any
  hideLabels?: boolean
  onChange: Function
}

export const Vector3Input = ({
  uniformScaling,
  smallStep,
  mediumStep,
  largeStep,
  value,
  hideLabels,
  onChange,
  ...rest
}: Vector3InputProp) => {
  const id = uniqueId++
  const newValue = new Vector3()
  const [uniformEnabled, setUniformEnabled] = useState(uniformScaling)

  const onToggleUniform = () => {
    setUniformEnabled(!uniformEnabled)
  }

  const processChange = (field, fieldValue) => {
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

  const onChangeX = (x) => processChange('x', x)

  const onChangeY = (y) => processChange('y', y)

  const onChangeZ = (z) => processChange('z', z)

  const vx = value ? value.x : 0
  const vy = value ? value.y : 0
  const vz = value ? value.z : 0
  const checkboxId = 'uniform-button-' + id

  return (
    <Vector3InputContainer>
      <UniformButtonContainer>
        {uniformScaling && (
          <>
            <Hidden as="input" id={checkboxId} type="checkbox" checked={uniformEnabled} onChange={onToggleUniform} />
            <label title="Uniform Scale" htmlFor={checkboxId}>
              {uniformEnabled ? <LinkIcon /> : <LinkOffIcon />}
            </label>
          </>
        )}
      </UniformButtonContainer>
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
      <NumericInput
        {...rest}
        value={vz}
        onChange={onChangeZ}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} tag="div" value={vz} onChange={onChangeZ} axis="z">
              Z
            </Vector3Scrubber>
          )
        }
      />
    </Vector3InputContainer>
  )
}

Vector3Input.defaultProps = {
  value: new Vector3(),
  hideLabels: false,
  onChange: () => {}
}

export default Vector3Input

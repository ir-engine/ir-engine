import React, { useState } from 'react'
import NumericInput from './NumericInput'
import Scrubber from './Scrubber'
import { Vector2 } from 'three'
import styled from 'styled-components'
import { Link } from '@styled-icons/fa-solid/Link'
import { Unlink } from '@styled-icons/fa-solid/Unlink'
import Hidden from '../layout/Hidden'

export const Vector2InputContainer = (styled as any).div`
  display: flex;
  flex-direction: row;
  flex: 1 1 auto;
  width: 70%;
  justify-content: flex-start;
`

export const Vector2Scrubber = (styled as any)(Scrubber)`
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

type StateType = {
  uniformEnabled: any
  value: any
}

interface Vector2InputProp {
  value?: any
  onChange?: Function
  uniformScaling?: boolean
}

/**
 *
 * @author Robert Long
 */
const Vector2Input = (props: Vector2InputProp) => {
  const id = uniqueId++
  let newValue = new Vector2()
  let [uniformEnabled, setUniformEnabled] = useState(props.uniformScaling)

  const onToggleUniform = () => {
    setUniformEnabled(!uniformEnabled)
  }

  const onChange = (field, fieldValue) => {
    const { value, onChange } = props

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

  const onChangeX = (x) => onChange('x', x)

  const onChangeY = (y) => onChange('y', y)

  const { uniformScaling, value, ...rest } = props
  const vx = value ? value.x : 0
  const vy = value ? value.y : 0
  const checkboxId = 'uniform-button-' + id

  return (
    <Vector2InputContainer>
      {uniformScaling && (
        <UniformButtonContainer>
          <Hidden as="input" id={checkboxId} type="checkbox" checked={uniformEnabled} onChange={onToggleUniform} />
          <label title="Uniform Scale" htmlFor={checkboxId}>
            {uniformEnabled ? <Link /> : <Unlink />}
          </label>
        </UniformButtonContainer>
      )}
      <Vector2Scrubber {...rest} tag="div" value={vx} onChange={onChangeX}>
        X:
      </Vector2Scrubber>
      <NumericInput {...rest} value={vx} onChange={onChangeX} />
      <Vector2Scrubber {...rest} tag="div" value={vy} onChange={onChangeY}>
        Y:
      </Vector2Scrubber>
      <NumericInput {...rest} value={vy} onChange={onChangeY} />
    </Vector2InputContainer>
  )
}

Vector2Input.defaultProps = {
  value: new Vector2(),
  onChange: () => {}
}

export default Vector2Input

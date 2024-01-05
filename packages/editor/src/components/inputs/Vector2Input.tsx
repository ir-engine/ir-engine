/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

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
  onChange?: (value: Vector2) => void
  onRelease?: (value: Vector2) => void
  uniformScaling?: boolean
  hideLabels?: boolean
}

export const Vector2Input = ({ value, onChange, onRelease, uniformScaling, hideLabels, ...rest }: Vector2InputProp) => {
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
        onRelease={(v) => {
          onChangeX(v)
          onRelease?.(newValue)
        }}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} tag="div" value={vx} onChange={onChangeX} onPointerUp={onRelease} axis="x">
              X
            </Vector3Scrubber>
          )
        }
      />
      <NumericInput
        {...rest}
        value={vy}
        onChange={onChangeY}
        onRelease={(v) => {
          onChangeY(v)
          onRelease?.(newValue)
        }}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} tag="div" value={vy} onChange={onChangeY} onPointerUp={onRelease} axis="y">
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

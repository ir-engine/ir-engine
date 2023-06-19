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

import { useHookstate } from '@hookstate/core'
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
  value: Vector3
  hideLabels?: boolean
  onChange: (v: Vector3) => void
  onRelease?: (v: Vector3) => void
}

export const Vector3Input = ({
  uniformScaling,
  smallStep,
  mediumStep,
  largeStep,
  value,
  hideLabels,
  onChange,
  onRelease,
  ...rest
}: Vector3InputProp) => {
  const id = uniqueId++
  const [uniformEnabled, setUniformEnabled] = useState(uniformScaling)
  const newValue = useHookstate(new Vector3(0, 0, 0))
  newValue.value.set(0, 0, 0)

  const onToggleUniform = () => {
    setUniformEnabled(!uniformEnabled)
  }

  const processChange = (field, fieldValue) => {
    if (uniformEnabled) {
      newValue.value.set(fieldValue, fieldValue, fieldValue)
    } else {
      const x = value ? value.x : 0
      const y = value ? value.y : 0
      const z = value ? value.z : 0

      newValue.set(
        new Vector3(field === 'x' ? fieldValue : x, field === 'y' ? fieldValue : y, field === 'z' ? fieldValue : z)
      )
    }

    if (typeof onChange === 'function') {
      onChange(newValue.value)
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
        onCommit={onRelease}
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
        onCommit={onRelease}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} tag="div" value={vy} onChange={onChangeY} onPointerUp={onRelease} axis="y">
              Y
            </Vector3Scrubber>
          )
        }
      />
      <NumericInput
        {...rest}
        value={vz}
        onChange={onChangeZ}
        onCommit={onRelease}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} tag="div" value={vz} onChange={onChangeZ} onPointerUp={onRelease} axis="z">
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

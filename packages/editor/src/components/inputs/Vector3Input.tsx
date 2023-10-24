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
import { Vector3 } from 'three'

import LinkIcon from '@mui/icons-material/Link'
import LinkOffIcon from '@mui/icons-material/LinkOff'

import Hidden from '../layout/Hidden'
import NumericInput from './NumericInput'

// style inheritance
import Scrubber from './Scrubber'
import './Vector3Input.css'

export const Vector3InputContainer: React.FC<{ children?: any }> = ({ children }) => {
  return <div className="Vector3InputContainer">{children}</div>
}

interface Vector3ScrubberProps {
  tag?: string
  axis?: 'x' | 'y' | 'z' | string
  value: number
  onChange: any
  onPointerUp?: any
  children?: any
  className?: string
}

export const Vector3Scrubber = ({ tag, axis, onChange, value, children, ...props }: Vector3ScrubberProps) => {
  props.className = `Vector3Scrubber ${axis}`
  const content = children ?? axis?.toUpperCase()
  return (
    <Scrubber tag={tag} onChange={onChange} value={value} {...props}>
      {content}
    </Scrubber>
  )
}

export const UniformButtonContainer: React.FC<{ children?: any }> = ({ children }) => {
  return <div className="UniformButtonContainer">{children}</div>
}

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

  const onToggleUniform = () => {
    setUniformEnabled(!uniformEnabled)
  }

  const processChange = (field: string, fieldValue: number) => {
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

  const onChangeX = (x: number) => processChange('x', x)

  const onChangeY = (y: number) => processChange('y', y)

  const onChangeZ = (z: number) => processChange('z', z)

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
        onRelease={onRelease}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vx} onChange={onChangeX} onPointerUp={onRelease} axis="x" />
          )
        }
      />
      <NumericInput
        {...rest}
        value={vy}
        onChange={onChangeY}
        onRelease={onRelease}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vy} onChange={onChangeY} onPointerUp={onRelease} axis="y" />
          )
        }
      />
      <NumericInput
        {...rest}
        value={vz}
        onChange={onChangeZ}
        onRelease={onRelease}
        prefix={
          hideLabels ? null : (
            <Vector3Scrubber {...rest} value={vz} onChange={onChangeZ} onPointerUp={onRelease} axis="z" />
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

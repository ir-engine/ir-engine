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

import React from 'react'

import Grid from '@mui/material/Grid'

import { InfoTooltip } from '../layout/Tooltip'
import { InputGroupContainer, InputGroupContent } from './InputGroup'
import NumericInput from './NumericInput'
import Scrubber from './Scrubber'

export interface NumericInputGroupProp {
  name?: string
  className?: any
  info?: any
  label?: any
  displayPrecision?: number
  smallStep?: number
  mediumStep?: number
  largeStep?: number
  min?: number
  max?: number
  value: any
  onChange: (value: any) => void
  onCommit?: (value: any) => void
  unit?: string
  convertFrom?: any
  convertTo?: any
  disabled?: boolean
  default?: any
}

function BaseNumericInputGroup({ name, className, label, ...rest }: NumericInputGroupProp) {
  const { displayPrecision, ...scrubberProps } = rest
  return (
    <InputGroupContainer>
      <Grid container spacing="10px">
        <Grid item xs={3} display="flex" alignItems="center" justifyContent="end">
          <InfoTooltip className="tooltip" title={label ?? name}>
            <Scrubber {...scrubberProps}>{label}</Scrubber>
          </InfoTooltip>
        </Grid>
        <Grid item xs={9}>
          <InputGroupContent>
            <NumericInput {...rest} />
          </InputGroupContent>
        </Grid>
      </Grid>
    </InputGroupContainer>
  )
}

/**
 *
 * @param {any} name
 * @param {any} className
 * @param {any} rest
 * @returns
 */
export function NumericInputGroup({ name, className, info, label, ...rest }: NumericInputGroupProp) {
  if (!info) {
    return <BaseNumericInputGroup name={name} className={className} label={label} {...rest} />
  } else {
    return (
      <InfoTooltip title={info}>
        <BaseNumericInputGroup name={name} className={className} label={label} {...rest} />
      </InfoTooltip>
    )
  }
}

export default NumericInputGroup

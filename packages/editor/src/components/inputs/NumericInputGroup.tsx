import React from 'react'

import Grid from '@mui/material/Grid'

import { InfoTooltip } from '../layout/Tooltip'
import { InputGroupContainer, InputGroupContent, InputGroupInfo } from './InputGroup'
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

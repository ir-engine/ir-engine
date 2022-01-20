import React from 'react'
import Grid from '@mui/material/Grid'
import { InputGroupContainer, InputGroupContent, InputGroupInfo } from './InputGroup'
import Scrubber from './Scrubber'
import NumericInput from './NumericInput'

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
  value?: any
  onChange: Function
  unit?: string
  convertFrom?: any
  convertTo?: any
  disabled?: boolean
  default?: any
}

/**
 *
 * @author Robert Long
 * @param {any} name
 * @param {any} className
 * @param {any} rest
 * @returns
 */
export function NumericInputGroup({ name, className, info, label, ...rest }: NumericInputGroupProp) {
  const { displayPrecision, ...scrubberProps } = rest
  return (
    <InputGroupContainer>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <Scrubber style={{ color: '#9FA4B5' }} {...scrubberProps}>
            {label}:
          </Scrubber>
        </Grid>
        <Grid item xs={8}>
          <InputGroupContent>
            <NumericInput {...rest} />
            {info && <InputGroupInfo info={info} />}
          </InputGroupContent>
        </Grid>
      </Grid>
    </InputGroupContainer>
  )
}

export default NumericInputGroup

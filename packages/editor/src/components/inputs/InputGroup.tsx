import React from 'react'
import styled from 'styled-components'
import Grid from '@mui/material/Grid'
import { InfoTooltip } from '../layout/Tooltip'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'

/**
 * Used to provide styles for InputGroupContainer div.
 *
 * @author Robert Long
 * @type {Styled component}
 */
export const InputGroupContainer = (styled as any).div`
  display: flex;
  flex-direction: row;
  padding: 4px 8px;
  flex: 1;
  min-height: 24px;

  ${(props) =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}

  & > label {
    display: block;
    color: ${(props) => props.theme.text2};
    padding-bottom: 2px;
    padding-top: 4px;
  }
`

/**
 * Used to provide styles for InputGroupContent div.
 *
 * @author Robert Long
 * @type {Styled component}
 */
export const InputGroupContent = (styled as any).div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;

  &>*:first-child {
    max-width: calc(100% - 23px)
  }

  & > label {
    display: block;
    width: 25%;
    color: ${(props) => props.theme.text2};
    padding-bottom: 2px;
    padding-top: 4px;
  }
`

export const InputGroupVerticalContainer = (styled as any).div`

  ${(props) =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}

  & > label {
    display: block;
    width: 25%;
    color: ${(props) => props.theme.text2};
    padding-bottom: 2px;
    padding-top: 4px;
  }
`

export const InputGroupVerticalContent = (styled as any).div`
  display: flex;
  flex-direction: column;
  flex: 1;
  padding-left: 8px;
`

/**
 * Used to provide styles for InputGroupInfoIcon div.
 *
 *  @author Robert Long
 *  @type {styled component}
 */
export const InputGroupInfoIcon = (styled as any)(HelpOutlineIcon)`
  width: 18px;
  display: flex;
  margin-left: 5px;
  color: ${(props) => props.theme.blue};
  cursor: pointer;
  align-self: center;
`

interface InputGroupInfoProp {
  info: string
}

/**
 * Used to render InfoTooltip component.
 *
 * @author Robert Long
 * @param  {string} info
 * @constructor
 */
export function InputGroupInfo({ info }: InputGroupInfoProp) {
  return (
    <InfoTooltip info={info}>
      <InputGroupInfoIcon />
    </InfoTooltip>
  )
}

/**
 * Declaring proptypes for InputGroupInfo Component.
 *
 * @author Robert Long
 * @type {Object}
 */

interface InputGroupProp {
  name: string
  children: any
  disabled?: boolean
  info?: string
  label?: string
  value?: any
}

/**
 * InputGroup used to render the view of component.
 *
 * @author Robert Long
 * @param       {string} name
 * @param       {any} children
 * @param       {boolean} disabled
 * @param       {string} info
 * @param       {any} rest
 * @param       {string} label
 * @constructor
 */
export function InputGroup({ name, children, disabled, info, label, ...rest }: InputGroupProp) {
  return (
    <InputGroupContainer disabled={disabled} {...rest}>
      <Grid container spacing={2}>
        <Grid item xs={4}>
          <label style={{ color: '#9FA4B5' }}>{label}:</label>
        </Grid>
        <Grid item xs={8}>
          <InputGroupContent>
            {children}
            {info && <InputGroupInfo info={info} />}
          </InputGroupContent>
        </Grid>
      </Grid>
    </InputGroupContainer>
  )
}

export default InputGroup

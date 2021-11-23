import React from 'react'
import styled from 'styled-components'
import { QuestionCircle } from '@styled-icons/fa-regular/QuestionCircle'
import { InfoTooltip } from '../layout/Tooltip'
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
  flex-direction: row;
  flex: 1;
  padding-left: 8px;
  
  & > label {
    display: block;
    width: 25%;
    color: ${(props) => props.theme.text2};
    padding-bottom: 2px;
    padding-top: 4px;
  }
`

export const InputGroupVerticalContainer = (styled as any).div`
  display: flex;
  flex-direction: column;
  padding: 4px 8px;
  flex: 1;

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
export const InputGroupInfoIcon = (styled as any)(QuestionCircle)`
  width: 20px;
  display: flex;
  padding-left: 8px;
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
      <label>{label}:</label>
      <InputGroupContent>
        {children}
        {info && <InputGroupInfo info={info} />}
      </InputGroupContent>
    </InputGroupContainer>
  )
}

export default InputGroup

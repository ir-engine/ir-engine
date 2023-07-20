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
import styled from 'styled-components'

import { InfoOutlined } from '@mui/icons-material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import Grid from '@mui/material/Grid'

import { InfoTooltip } from '../layout/Tooltip'
import styles from './InputGroup.module.scss'

/**
 * Used to provide styles for InputGroupContainer div.
 *
 * @type {Styled component}
 */
export const InputGroupContainer = (styled as any).div`
  display: flex;
  flex-direction: row;
  padding: 4px 8px;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  min-height: 24px;

  ${(props) =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}

  .tooltip {
    color: var(--textColor);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
`

/**
 * Used to provide styles for InputGroupContent div.
 *
 * @type {Styled component}
 */
export const InputGroupContent = (styled as any).div`
  display: flex;
  justify-content: space-between;
  margin-left: 5px;

  & > *:first-child {
    max-width: calc(100% - 2px);
  }

  & > label {
    display: block;
    width: 35%;
    color: var(--textColor);
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
    width: 35%;
    color: var(--textColor);
    padding-bottom: 2px;
    padding-top: 4px;
  }
`

export const InputGroupVerticalContainerWide = (styled as any).div`
  ${(props) =>
    props.disabled &&
    `
    pointer-events: none;
    opacity: 0.3;
  `}

  & > label {
    display: block;
    width: 100%;
    color: var(--textColor);
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
 *  @type {styled component}
 */
export const InputGroupInfoIcon = (styled as any)(HelpOutlineIcon)`
  width: 18px;
  display: flex;
  margin-left: 5px;
  color: var(--iconButtonColor);
  cursor: pointer;
  align-self: center;
`

interface InputGroupInfoProp {
  info: string | JSX.Element
}

/**
 * Used to render InfoTooltip component.
 *
 * @param  {string} info
 * @constructor
 */
export function InputGroupInfo({ info }: InputGroupInfoProp) {
  return (
    <InfoTooltip title={info}>
      <InputGroupInfoIcon />
    </InfoTooltip>
  )
}

/**
 * Declaring proptypes for InputGroupInfo Component.
 *
 * @type {Object}
 */
export type InputGroupProps = React.PropsWithChildren<
  {
    name: string
    disabled?: boolean
    label?: string
    value?: any
  } & Partial<InputGroupInfoProp>
>

/**
 * InputGroup used to render the view of component.
 *
 * @param       {string} name
 * @param       {any} children
 * @param       {boolean} disabled
 * @param       {string} info
 * @param       {any} rest
 * @param       {string} label
 * @constructor
 */
export function InputGroup({ name, children, disabled, info, label, ...rest }: InputGroupProps) {
  console.log('info', info)
  return (
    <InputGroupContainer disabled={disabled} {...rest}>
      <Grid container>
        <Grid item xs={4} display="flex" alignItems="center" justifyContent="end">
          <InfoTooltip className="tooltip" title={label ?? name}>
            <label>{label}</label>
          </InfoTooltip>

          {info && (
            <InfoTooltip title={info}>
              <InfoOutlined className={styles.info} />
            </InfoTooltip>
          )}
        </Grid>
        <Grid item xs={8}>
          <InputGroupContent>{children}</InputGroupContent>
        </Grid>
      </Grid>
    </InputGroupContainer>
  )
}

export default InputGroup

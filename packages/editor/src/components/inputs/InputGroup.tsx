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

import { InfoOutlined } from '@mui/icons-material'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import { createStyles } from '@mui/material'
import Grid from '@mui/material/Grid'
import makeStyles from '@mui/styles/makeStyles'

import { InfoTooltip } from '../layout/Tooltip'

import './InputGroup.css'

const useStyles = makeStyles<any, any, any>((theme: any) => {
  return createStyles({
    info: {
      color: 'var(--textColor)',
      height: '16px',
      width: 'auto',
      marginLeft: '5px'
    }
  })
})

/**
 * Used to provide styles for InputGroupContainer div.
 *
 * @type {component}
 */
export const InputGroupContainer = ({ disabled = false, children, ...rest }) => (
  <div className={`input-group-container ${disabled ? 'disabled' : ''}`} {...rest}>
    {children}
  </div>
)
/**
 * Used to provide styles for InputGroupContent div.
 *
 * @type {component}
 */
export const InputGroupContent = ({ children }) => <div className="input-group-content">{children}</div>

export const InputGroupVerticalContainer = ({ disabled = false, children }) => (
  <div className={`input-group-vertical-container ${disabled ? 'disabled' : ''}`}>{children}</div>
)

export const InputGroupVerticalContainerWide = ({ disabled = false, children }) => (
  <div className={`input-group-vertical-container-wide ${disabled ? 'disabled' : ''}`}>{children}</div>
)

export const InputGroupVerticalContent = ({ children }) => (
  <div className="input-group-vertical-content">{children}</div>
)
/**
 * Used to provide styles for InputGroupInfoIcon div.
 *
 *  @type {component}
 */
export const InputGroupInfoIcon = ({ onClick = () => {} }) => (
  <HelpOutlineIcon className="input-group-info-icon" onClick={onClick} />
)

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
  const styles = useStyles({})

  return (
    <InputGroupContainer disabled={disabled} {...rest}>
      <Grid container>
        <Grid item xs={4} display="flex" alignItems="center" justifyContent="end">
          <label className="label">{label}</label>

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

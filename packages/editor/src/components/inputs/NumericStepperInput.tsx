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

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import { InfoTooltip } from '../layout/Tooltip'
import NumericInput from './NumericInput'

const StepperInputContainer = (styled as any).div`
  display: flex;
  flex: 1;
  width: 100%;
  height: 24px;

  input {
    border-left-width: 0;
    border-right-width: 0;
    border-radius: 0;
  }
`

const StepperButton = (styled as any).button`
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: ${(props) => (props.value ? 'var(--blue)' : 'var(--toolbar)')};

  border: 1px solid var(--inputOutline);
  color: var(--textColor);

  width: 20px;
  padding: 0;

  ${(props) =>
    props.left
      ? `border-top-left-radius: 4px; border-bottom-left-radius: 4px;`
      : `border-top-right-radius: 4px; border-bottom-right-radius: 4px;`}

  :hover {
    background-color: var(--blueHover);
  }

  :active {
    background-color: var(--blue);
  }
`

/**
 *
 * @param {any} style
 * @param {any} className
 * @param {any} decrementTooltip
 * @param {any} incrementTooltip
 * @param {any} rest
 * @returns
 */
export function NumericStepperInput({
  style,
  className,
  decrementTooltip,
  incrementTooltip,
  onChange,
  value,
  mediumStep,
  ...rest
}: any) {
  const onIncrement = () => onChange(value + mediumStep)
  const onDecrement = () => onChange(value - mediumStep)

  return (
    <StepperInputContainer style={style} className={className}>
      <InfoTooltip title={decrementTooltip} placement="bottom">
        <StepperButton left onClick={onDecrement}>
          <ArrowLeftIcon fontSize="small" />
        </StepperButton>
      </InfoTooltip>
      <NumericInput {...rest} onChange={onChange} value={value} mediumStep={mediumStep} />
      <InfoTooltip title={incrementTooltip} placement="bottom">
        <StepperButton right onClick={onIncrement}>
          <ArrowRightIcon fontSize="small" />
        </StepperButton>
      </InfoTooltip>
    </StepperInputContainer>
  )
}

export default NumericStepperInput

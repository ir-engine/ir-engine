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

import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import ArrowRightIcon from '@mui/icons-material/ArrowRight'

import { t } from 'i18next'
import { InfoTooltip } from '../layout/Tooltip'
import NumericInput, { NumericInputProp } from './NumericInput'

const stepperInputContainerStyle = {
  display: 'flex',
  flex: '1',
  width: '100%',
  height: '24px'
}

const stepperButtonStyle = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  backgroundColor: 'var(--toolbar)',
  border: '1px solid var(--inputOutline)',
  color: 'var(--textColor)',
  width: '20px',
  padding: '0'
}

const leftStepperButtonStyle = {
  ...stepperButtonStyle,
  borderTopLeftRadius: '4px',
  borderBottomLeftRadius: '4px'
}

const rightStepperButtonStyle = {
  ...stepperButtonStyle,
  borderTopRightRadius: '4px',
  borderBottomRightRadius: '4px'
}

export function NumericStepperInput({
  style,
  className,
  decrementTooltip,
  incrementTooltip,
  onChange,
  value,
  mediumStep,
  ...rest
}: {
  style?: React.CSSProperties
  className?: string
  incrementTooltip?: string
  decrementTooltip?: string
  onChange: (val) => void
  value: number
  mediumStep: number
} & NumericInputProp) {
  const onIncrement = () => onChange(value + mediumStep)
  const onDecrement = () => onChange(value - mediumStep)

  return (
    <div style={{ ...stepperInputContainerStyle, ...style }} className={className}>
      <InfoTooltip title={decrementTooltip} placement="bottom">
        <button style={leftStepperButtonStyle} onClick={onDecrement}>
          <ArrowLeftIcon fontSize="small" />
        </button>
      </InfoTooltip>
      <NumericInput {...rest} onChange={onChange} value={value} mediumStep={mediumStep} />
      <InfoTooltip title={incrementTooltip} placement="bottom">
        <button style={rightStepperButtonStyle} onClick={onIncrement}>
          <ArrowRightIcon fontSize="small" />
        </button>
      </InfoTooltip>
    </div>
  )
}

NumericStepperInput.defaultProps = {
  incrementTooltip: t('editor:toolbar.grid.info-incrementHeight'),
  decrementTooltip: t('editor:toolbar.grid.info-decrementHeight')
}

export default NumericStepperInput

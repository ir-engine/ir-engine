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
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa'

import { t } from 'i18next'
import { twMerge } from 'tailwind-merge'
import NumericInput, { NumericInputProp } from '..'
import { InfoTooltip } from '../../../layout/Tooltip'

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
  onChange: (val: number) => void
  value: number
  mediumStep: number
} & NumericInputProp) {
  const onIncrement = () => onChange(value + mediumStep)
  const onDecrement = () => onChange(value - mediumStep)

  return (
    <div className={twMerge('flex h-6 w-full flex-1', className)}>
      <InfoTooltip title={decrementTooltip}>
        <button
          className={twMerge('m-0 flex w-5 justify-center p-0 align-middle', 'rounded-bl rounded-tl')}
          onClick={onDecrement}
        >
          <FaChevronLeft fontSize="small" />
        </button>
      </InfoTooltip>
      <NumericInput {...rest} onChange={onChange} value={value} mediumStep={mediumStep} />
      <InfoTooltip title={incrementTooltip}>
        <button
          className={twMerge('m-0 flex w-5 justify-center p-0 align-middle', 'rounded-br rounded-tr')}
          onClick={onIncrement}
        >
          <FaChevronRight fontSize="small" />
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

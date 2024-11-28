/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import React, { useId, useLayoutEffect, useRef, useState } from 'react'
import { twMerge } from 'tailwind-merge'
import { HelpIconSm } from '../../../icons'
import Tooltip from '../Tooltip'

export const variantSizes = {
  xs: 'h-6 py-0.5 px-2',
  l: 'h-8 py-1.5 px-2',
  xl: 'h-10 py-2.5 px-2'
} as const

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'> {
  variantSize?: keyof typeof variantSizes

  /**
   * Optional React node to display at the start (left) of the s field.
   * Typically used for icons or other UI elements that provide additional context.
   */
  startComponent?: React.ReactNode

  /**
   * Optional React node to display at the end (right) of the input field.
   * Typically used for icons, buttons, or other UI elements that provide actions or additional information.
   */
  endComponent?: React.ReactNode

  /**
   * Specifies the validation state of the input field, affecting its outline color and the color of helper text.
   * - `success` indicates a successful input.
   * - `error` indicates an error in the input.
   */
  state?: 'success' | 'error'

  /**
   * Optional helper text that provides additional information about the input field.
   * When set, this will only be displayed when a valid `state` (`success` or `error`) is set.
   * The color of the helper text is determined by the current state.
   */
  helperText?: string

  fullWidth?: boolean

  labelProps?: {
    text: string
    position: 'top' | 'left'
    infoText?: string
  }
}

const Input = (
  {
    variantSize = 'l',
    startComponent,
    endComponent,
    state,
    helperText,
    labelProps,
    required,
    id,
    fullWidth,
    ...props
  }: InputProps,
  ref: React.ForwardedRef<HTMLInputElement>
) => {
  const tempId = useId()
  const inputId = id || tempId

  const labelRef = useRef<HTMLLabelElement>(null)

  const [helperOffset, setHelperOffset] = useState('')
  useLayoutEffect(() => {
    const updateHelperTextPosition = () => {
      if (labelProps?.position === 'left' && labelRef.current) {
        setHelperOffset(`${labelRef.current.offsetWidth + 8}px`)
      } else {
        setHelperOffset('')
      }
    }

    updateHelperTextPosition()

    window.addEventListener('resize', updateHelperTextPosition)
    return () => {
      window.removeEventListener('resize', updateHelperTextPosition)
    }
  }, [labelProps])

  return (
    <div className={`flex flex-col gap-y-2 ${fullWidth ? 'w-full' : 'w-fit'}`}>
      <div
        className={`flex ${labelProps?.position === 'top' && 'flex-col gap-y-2'} ${
          labelProps?.position === 'left' && 'flex-row items-center gap-x-2'
        }`}
      >
        {labelProps?.text && (
          <label htmlFor={inputId} className="block text-xs font-medium" ref={labelRef}>
            <div className="flex flex-row items-center gap-x-1.5">
              <div className="flex flex-row items-center gap-x-0.5">
                {required && <span className="text-sm text-[#E11D48]">*</span>}
                <span className="text-xs text-[#D3D5D9]">{labelProps.text}</span>
              </div>

              {labelProps?.infoText && (
                <Tooltip content={labelProps.infoText}>
                  <HelpIconSm className="text-[#9CA0AA]" />
                </Tooltip>
              )}
            </div>
          </label>
        )}

        <div
          className={twMerge(
            'flex w-full items-center gap-x-2 rounded-md border-[0.5px] border-[#42454D] bg-[#141619] transition-colors duration-300',
            variantSizes[variantSize],
            'hover:border-[#9CA0AA] hover:bg-[#191B1F]',
            'has-[:focus]:border-[#375DAF] has-[:focus]:outline-none',
            'has-[:disabled]:border-[#42454D] has-[:disabled]:bg-[#191B1F]',
            state === 'success' && 'border-[#10B981]',
            state === 'error' && 'border-[#C3324B]'
          )}
        >
          <input
            spellCheck={false}
            className="peer order-2 h-full w-full bg-[#141619] text-[#9CA0AA] outline-none autofill:bg-red-500 focus:bg-[#141619] focus:text-[#F5F5F5] focus-visible:bg-[#141619] disabled:text-[#6B6F78]"
            ref={ref}
            id={inputId}
            {...props}
          />
          {startComponent && (
            <div className="order-1 flex items-center justify-center text-[#9CA0AA] peer-disabled:text-[#42454D]">
              {startComponent}
            </div>
          )}
          {endComponent && (
            <div className="order-3 flex items-center justify-center text-[#9CA0AA] peer-disabled:text-[#42454D]">
              {endComponent}
            </div>
          )}
        </div>
      </div>

      {helperText && (
        <span
          className={`text-xs ${state === 'success' && 'text-[#0D9467]'} ${state === 'error' && 'text-[#C3324B]'}`}
          style={{
            translate: helperOffset
          }}
        >
          {helperText}
        </span>
      )}
    </div>
  )
}

export default React.forwardRef(Input)

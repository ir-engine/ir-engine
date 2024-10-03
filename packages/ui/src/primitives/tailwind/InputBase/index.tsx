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

import React, { ReactNode, useId } from 'react'
import { twMerge } from 'tailwind-merge'

const variantSizes = {
  xs: 'h-6 py-0.5 px-2',
  l: 'h-8 py-1.5 px-2',
  xl: 'h-10 py-2.5 px-2'
} as const

export interface InputBaseProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variantSize: keyof typeof variantSizes

  /**
   * Optional React node to display at the start (left) of the s field.
   * Typically used for icons or other UI elements that provide additional context.
   */
  startComponent?: ReactNode

  /**
   * Optional React node to display at the end (right) of the input field.
   * Typically used for icons, buttons, or other UI elements that provide actions or additional information.
   */
  endComponent?: ReactNode

  /** When true, the input field will expand to fill the width of its parent container. */
  fullWidth?: boolean

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
}

const InputBase = (
  { variantSize, startComponent, endComponent, fullWidth, state, helperText, id, ...props }: InputBaseProps,
  ref: React.ForwardedRef<HTMLInputElement>
) => {
  const tempId = useId()
  const inputId = id || tempId
  const twClassName = twMerge(
    'w-full rounded-md border-[0.5px] border-[#42454D] bg-[#141619] text-[#9CA0AA]',
    variantSizes[variantSize],
    'hover:border-[#9CA0AA] hover:bg-[#191B1F]',
    'focus:border-[#375DAF]',
    'disabled:border-[#42454D] disabled:bg-[#191B1F] disabled:text-[#6B6F78]',
    state === 'success' ? 'border-[#10B981]' : '',
    state === 'error' ? 'border-[#C3324B]' : ''
  )

  return <input className={twClassName} ref={ref} id={inputId} {...props} />
}

export default React.forwardRef(InputBase)

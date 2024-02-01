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

import { HandThumbUpIcon } from '@heroicons/react/24/solid'
import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

/**
 * Button component with customizable label position.
 *
 * @component
 * @param {Object} props - The component props.
 * @param {ReactNode} props.icon - The icon to display in the button.
 * @param {string} props.title - The title of the button.
 * @param {'left' | 'right' | 'above' | 'below'} [props.labelPosition='left'] - The position of the label relative to the button.
 * @param {string} [props.className] - Additional CSS classes for the button.
 * @returns {JSX.Element} - The Button component.
 */

interface ButtonProps {
  icon: ReactNode
  title: string
  showLabel?: boolean
  labelPosition?: 'left' | 'right' | 'above' | 'below'
}

const Button = ({ icon, title, showLabel, labelPosition, className, ...props }: ButtonProps & any): JSX.Element => {
  const labelContainerClass = twMerge(
    'flex items-center',
    labelPosition === 'above' || labelPosition === 'below' ? 'flex-col' : 'flex-row'
  )
  const labelClass = {
    above: 'mb-1',
    below: 'mt-1',
    left: 'mr-1',
    right: 'ml-1'
  }

  return (
    <button className={twMerge('m-0 btn h-auto tooltip', className)} {...props} data-tip={title}>
      <span className={labelContainerClass}>
        {showLabel === true ? <span className={labelClass[labelPosition]}>{title}</span> : null}
        {icon !== undefined && icon}
      </span>
    </button>
  )
}

Button.displayName = 'Button'

Button.defaultProps = {
  title: '',
  showLabel: true,
  labelPosition: 'right',
  icon: <HandThumbUpIcon className="block w-4 h-4" />
}

export default Button

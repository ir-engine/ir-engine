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

import React, { ReactNode } from 'react'
import { IconType } from 'react-icons'
import { twMerge } from 'tailwind-merge'

/**
 * Button component
 *
 * @param {ReactNode} startIcon - SVG Icon placed before the children.
 * @param {ReactNode} children - The content of the button.
 * @param {ReactNode} endIcon - SVG Icon placed after the children.
 * @param {'small' | 'medium' | 'large'} [size] - The size of the component. small is equivalent to the dense button styling.
 * @param {boolean} [fullWidth] - If true, the button will take up the full width of its container
 * @param {string} [backgroundColor] - The background color of the button. Default is #375DAF.
 * @param {boolean} [round] - If true, a capsule button is rendered.
 * @returns {JSX.Element} - The Button component.
 */

export interface ButtonProps extends React.HTMLAttributes<HTMLButtonElement> {
  startIcon?: IconType | React.ReactElement // SVGElement
  children?: ReactNode
  endIcon?: IconType | React.ReactElement // SVGElement
  size?: 'small' | 'medium' | 'large'
  fullWidth?: boolean
  backgroundColor?: string
  round?: boolean
}

const Button = ({
  startIcon: StartIcon,
  children,
  endIcon: EndIcon,
  size,
  fullWidth,
  backgroundColor,
  round,
  ...props
}: ButtonProps): JSX.Element => {
  const color = '#FFFFFF' // no matter the theme

  const sizes = {
    small: {
      fontSize: 'text-sm',
      padding: 'px-3 py-2',
      svgSize: '1.5rem'
    },
    medium: {
      fontSize: 'text-base',
      padding: 'px-4 py-2',
      svgSize: '2rem'
    },
    large: {
      fontSize: 'text-lg',
      padding: 'px-7 py-3',
      svgSize: '2.4rem'
    }
  }

  const className = twMerge(
    sizes[size!].fontSize,
    sizes[size!].padding,
    fullWidth ? 'w-full' : 'w-fit',
    round ? 'rounded-full' : 'rounded-lg',
    'flex justify-between items-center font-semibold',
    'transition ease-in-out delay-150 hover:drop-shadow-xl hover:-translate-y-0.5 hover:scale-110 duration-100'
  )

  const buttonStyles = {
    color: color
  }
  if (backgroundColor) {
    buttonStyles['backgroundColor'] = backgroundColor
  }

  return (
    <button className={className} style={buttonStyles} {...props}>
      {StartIcon && (
        <span className="mx-1">
          {typeof StartIcon === 'function' ? <StartIcon color={color} size={sizes[size!].svgSize} /> : StartIcon}
        </span>
      )}
      {children && <span className={twMerge('mx-1', fullWidth ? 'mx-auto' : '')}> {children}</span>}
      {EndIcon && (
        <span className="mx-1">
          {typeof EndIcon === 'function' ? <EndIcon color={color} size={sizes[size!].svgSize} /> : EndIcon}
        </span>
      )}
    </button>
  )
}

Button.displayName = 'Button'

Button.defaultProps = {
  size: 'medium'
}

export default Button

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

const Button = ({ icon, title, showLabel, labelPosition, className, ...props }: ButtonProps & any): JSX.Element => (
  <button className={twMerge('btn h-auto tooltip', className)} {...props} data-tip={title}>
    {labelPosition === 'above' ? (
      <span className="flex flex-col items-center">
        {showLabel === true ? <span className="mb-1">{title}</span> : null}
        {icon !== undefined ? icon : null}
      </span>
    ) : null}
    {labelPosition === 'below' ? (
      <span className="flex flex-col items-center">
        {icon !== undefined ? icon : null}
        {showLabel === true ? <span className="mt-1">{title}</span> : null}
      </span>
    ) : null}
    {labelPosition === 'right' ? (
      <span className="flex flex-row items-center">
        {icon !== undefined ? icon : null}
        {showLabel === true ? <span className="ml-1">{title}</span> : null}
      </span>
    ) : null}
    {labelPosition === 'left' ? (
      <span className="flex items-center">
        {showLabel === true ? <span className="mr-1">{title}</span> : null}
        {icon !== undefined ? icon : null}
      </span>
    ) : null}
  </button>
)

Button.displayName = 'Button'

Button.defaultProps = {
  title: '',
  showLabel: true,
  labelPosition: 'right',
  icon: <HandThumbUpIcon className="block w-4 h-4" />
}

export default Button

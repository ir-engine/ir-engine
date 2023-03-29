import { HandThumbUpIcon } from '@heroicons/react/24/solid'
import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

const Button = ({ icon, title, className, ...props }: { icon: ReactNode; title: string } & any) => (
  <button className={twMerge('btn', className)} {...props}>
    {icon !== undefined ? icon : null}
    {title !== undefined ? title : null}
  </button>
)

Button.displayName = 'Button'

Button.defaultProps = {
  title: "I'm a button",
  icon: <HandThumbUpIcon className="w-1 h-1 mr-1" />
}

export default Button

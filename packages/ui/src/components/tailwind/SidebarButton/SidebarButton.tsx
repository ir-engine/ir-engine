import Button from '@etherealengine/ui/src/primitives/tailwind/Button'
import React from 'react'
import { twMerge } from 'tailwind-merge'

export function SidebarButton({ children, className, ...rest }) {
  return (
    <Button className={twMerge('bg-[#141619]', className)} {...rest}>
      {children}
    </Button>
  )
}

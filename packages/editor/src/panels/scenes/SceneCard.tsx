import React, { ReactNode } from 'react'
import { twMerge } from 'tailwind-merge'

type Props = Readonly<{
  children: ReactNode
  className: string
}>
export default function SceneCard({ children, className }: Props) {
  return (
    <div
      className={twMerge(
        'col-span-2 inline-flex h-64 w-64 min-w-64 max-w-64 flex-col',
        'rounded-lg border border-ui-tertiary shadow-lg',
        'dark:border-ui-outline dark:bg-ui-background lg:col-span-1',
        className
      )}
    >
      {children}
    </div>
  )
}

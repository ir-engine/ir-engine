import React from 'react'
import { HiCheck } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

export interface DropdownItemProps extends React.HTMLAttributes<HTMLDivElement> {
  /**text shown on the left end */
  title: string
  Icon?: ({ className }: { className?: string }) => JSX.Element
  /**text shown on the right end */
  secondaryText?: string
  disabled?: boolean
  selected?: boolean
  className?: string
}

export function DropdownItem({
  title,
  disabled,
  Icon,
  selected,
  secondaryText,
  className,
  ...props
}: DropdownItemProps) {
  return (
    <div
      tabIndex={0}
      className={twMerge(
        'h-[38px] w-full cursor-pointer bg-[#141619] px-4 py-2.5 text-xs text-[#9CA0AA] outline-none',
        'flex items-center',
        !disabled && 'hover:text-[#F5F5F5] focus:text-[#F5F5F5]',
        !disabled && selected && 'bg-[#191B1F] text-[#375DAF]',
        disabled && 'bg-[#191B1F] text-[#42454D]',
        className
      )}
      {...props}
    >
      <span className="flex items-center gap-2">
        {Icon && <Icon className={twMerge('h-3 w-3', selected && 'text-[#F5F5F5]')} />}
        {title}
      </span>
      {secondaryText && <span className="ml-auto">{secondaryText}</span>}
      {!secondaryText && selected && <HiCheck className="ml-auto h-3 w-3" />}
    </div>
  )
}

const variants = {
  /**for small action buttons with multiple actions */
  sm: 'w-60',
  /**for menu items with icons */
  md: 'w-80',
  /**for search */
  lg: 'w-[520px]'
}

export interface DropdownListProps {
  variant?: keyof typeof variants
  items: (Omit<DropdownItemProps, 'className'> & { value: any })[]
  /**should be equal to one of the values in `items` */
  value: any
  onChange: (value: any) => void
}

export default function DropdownList({ variant = 'md', items, value, onChange }: DropdownListProps) {
  return (
    <div className={variants[variant]}>
      {items.map((item, index) => (
        <DropdownItem
          className={twMerge(index === 0 && 'rounded-t-lg', index === items.length - 1 && 'rounded-b-lg')}
          key={index + item.title}
          selected={value === item.value}
          onClick={() => onChange(item.value)}
          onKeyUp={(event) => ['Enter', ' '].includes(event.key) && onChange(item.value)}
          {...item}
        />
      ))}
    </div>
  )
}

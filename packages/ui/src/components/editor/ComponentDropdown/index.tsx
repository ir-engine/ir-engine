import React, { useState } from 'react'
import { HiCube, HiMiniXMark, HiOutlineChevronDown, HiOutlineChevronRight } from 'react-icons/hi2'
import { twMerge } from 'tailwind-merge'

export interface ComponentDropdownProps {
  name?: string
  description?: string
  /**icon for this component (by default: a cube icon will be shown) */
  Icon?: ({ className }: { className?: string }) => JSX.Element
  /**action when the component is removed */
  onClose?: () => void
  children?: React.ReactNode
  minimizedDefault?: boolean
}

export default function ComponentDropdown({
  minimizedDefault,
  Icon = HiCube,
  name,
  description,
  children,
  onClose
}: ComponentDropdownProps) {
  const [isMinimized, setIsMinimized] = useState(minimizedDefault ?? true)

  return (
    <div
      className={twMerge(
        'group w-full rounded bg-[#212226] p-2 transition-all duration-300 ease-out focus:border focus:border-[#375DAF] focus:outline-0',
        isMinimized && 'h-10'
      )}
      tabIndex={0}
    >
      <div className="flex items-center">
        <button
          className="my-1 text-[#9CA0AA] group-hover:text-[#F5F5F5] group-focus:text-[#F5F5F5]"
          title={isMinimized ? 'maximize' : 'minimize'}
          onClick={() => setIsMinimized((prev) => !prev)}
        >
          {isMinimized ? <HiOutlineChevronRight className="h-4 w-4" /> : <HiOutlineChevronDown className="h-4 w-4" />}
        </button>
        <button className="ml-2 text-[#9CA0AA] group-hover:text-[#F5F5F5] group-focus:text-[#F5F5F5]">
          <Icon className="h-5 w-5" />
        </button>
        <span className="ml-1 text-sm leading-6 text-[#B2B5BD] group-hover:text-[#D3D5D9] group-focus:text-[#F5F5F5]">
          {name}
        </span>
        <button
          className="ml-auto text-[#1A1B1E] group-hover:text-[#6B6F78] group-focus:text-[#6B6F78]"
          onClick={onClose}
        >
          <HiMiniXMark className="h-2 w-2 group-hover:h-4 group-hover:w-4 group-focus:h-4 group-focus:w-4" />
        </button>
      </div>
      {!isMinimized && <div className="text-center text-xs leading-[18px] text-[#D3D5D9]">{description}</div>}
      <div className="mt-4">{children}</div>
    </div>
  )
}

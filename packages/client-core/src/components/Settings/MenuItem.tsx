import { ChevronRightSm } from '@ir-engine/ui/src/icons'
import React from 'react'
interface MenuItemProps {
  label: string
  onClick: () => void
  hasChevron?: boolean
}
export const MenuItem: React.FC<MenuItemProps> = ({ label, onClick, hasChevron = false }) => (
  <div className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-white/90" onClick={onClick}>
    <span className="font-medium">{label}</span>
    {hasChevron && <ChevronRightSm className="text-white/70" />}
  </div>
)

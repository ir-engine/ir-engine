import React from 'react'
import { SectionProps } from './MainMenu'

export const Section: React.FC<SectionProps> = ({ children, className = '' }) => (
  <div
    className={`overflow-hidden rounded-xl shadow-sm ${className}`}
    style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    }}
  >
    <div className="">{children}</div>
  </div>
)

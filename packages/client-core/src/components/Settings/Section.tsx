/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'

export interface SectionProps {
  children: React.ReactNode
  className?: string
  disabled?: boolean
}

export const Section: React.FC<SectionProps> = ({ children, className = '', disabled }) => (
  <div
    className={`
      overflow-hidden rounded-xl border border-white/10 
      bg-gradient-to-bl from-white/10 to-transparent font-dm-sans  
      text-xs
      tracking-wide shadow-sm md:text-base
      ${disabled ? 'pointer-events-none opacity-50' : ''} 
      ${className} 
    `}
  >
    {children}
  </div>
)

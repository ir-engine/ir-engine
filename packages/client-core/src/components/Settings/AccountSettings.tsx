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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023
Infinite Reality Engine. All Rights Reserved.
*/

import React from 'react'

import { ChevronRightSm } from '@ir-engine/ui/src/icons'

// Define types for screen components
interface ScreenProps {
  navigateTo: (screen: string) => void
  onClose?: () => void
}

// Define types for our components
interface MenuItemProps {
  label: string
  onClick: () => void
  hasChevron?: boolean
}

// Define a Section component for grouping related settings
interface SectionProps {
  children: React.ReactNode
  className?: string
}

// Define reusable UI components
const MenuItem: React.FC<MenuItemProps> = ({ label, onClick, hasChevron = false }) => (
  <div className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-white/90" onClick={onClick}>
    <span className="font-medium">{label}</span>
    {hasChevron && <ChevronRightSm className="text-white/70" />}
  </div>
)

const Section: React.FC<SectionProps> = ({ children, className = '' }) => (
  <div
    className={`overflow-hidden rounded-xl shadow-sm ${className}`}
    style={{
      background: 'linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.05))',
      border: '1px solid rgba(255, 255, 255, 0.05)'
    }}
  >
    <div className="divide-y divide-white/10">{children}</div>
  </div>
)

// Define a divider component for items within a section
const Divider = () => <div className="h-px bg-white/10"></div>

const AccountSettings: React.FC<ScreenProps> = ({ navigateTo }) => (
  <div className="space-y-4">
    <Section>
      <MenuItem label="Username & Password" onClick={() => navigateTo('usernamePassword')} hasChevron />
      <Divider />
      <MenuItem label="User ID" onClick={() => navigateTo('userId')} hasChevron />
      <Divider />
      <MenuItem label="Permissions" onClick={() => navigateTo('permissions')} hasChevron />
    </Section>

    <Section>
      <MenuItem label="Single Sign On" onClick={() => navigateTo('sso')} hasChevron />
      <Divider />
      <MenuItem label="Delete My Account" onClick={() => navigateTo('deleteAccount')} hasChevron />
    </Section>
  </div>
)

export default AccountSettings

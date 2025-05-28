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
import SliderItem from './SliderItem'
import ToggleItem from './ToggleItem'

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

const MainMenu: React.FC<ScreenProps> = ({ navigateTo }) => (
  <div className="space-y-4">
    {/* Communication Section */}
    <Section>
      <MenuItem label="Share Space" onClick={() => navigateTo('shareSpace')} hasChevron />
      <Divider />
      <ToggleItem label="Video Communication" defaultChecked />
      <Divider />
      <ToggleItem label="Spatial Audio" />
      <Divider />
      <SliderItem label="Mic Volume" defaultValue={30} />
      <Divider />
      <SliderItem label="Audio Volume" defaultValue={70} />
    </Section>

    {/* World & Account Section */}
    <Section>
      <MenuItem label="World" onClick={() => navigateTo('world')} hasChevron />
      <Divider />
      <ToggleItem label="Multiplayer" />
      <Divider />
      <MenuItem label="Account" onClick={() => navigateTo('account')} hasChevron />
      <Divider />
      <MenuItem label="Avatar" onClick={() => navigateTo('avatar')} hasChevron />
    </Section>

    {/* System Section */}
    <Section>
      <MenuItem label="Controls" onClick={() => navigateTo('controls')} hasChevron />
      <Divider />
      <MenuItem label="Call Title" onClick={() => navigateTo('callTitle')} hasChevron />
      <Divider />
      <MenuItem label="Graphics" onClick={() => navigateTo('graphics')} hasChevron />
    </Section>

    {/* Logout Section */}
    <Section className="overflow-hidden">
      <button className="w-full py-3.5 font-medium text-white">Log Out</button>
    </Section>
  </div>
)

export default MainMenu

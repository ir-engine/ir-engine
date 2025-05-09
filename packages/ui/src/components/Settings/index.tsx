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

import { AnimatePresence, motion } from 'framer-motion'
import React, { useState } from 'react'

// Import icons from the icons module
import { ArrowLeftSm, ChevronRightSm, XCloseSm } from '../../icons'

// Define types for our components
interface MenuItemProps {
  label: string
  onClick: () => void
  hasChevron?: boolean
}

interface ToggleItemProps {
  label: string
  defaultChecked?: boolean
}

interface SliderItemProps {
  label: string
  defaultValue?: number
}

// Define reusable UI components
const MenuItem: React.FC<MenuItemProps> = ({ label, onClick, hasChevron = false }) => (
  <div className="flex cursor-pointer items-center justify-between px-4 py-3.5 text-white/90" onClick={onClick}>
    <span className="font-medium">{label}</span>
    {hasChevron && <ChevronRightSm className="text-white/70" />}
  </div>
)

const ToggleItem: React.FC<ToggleItemProps> = ({ label, defaultChecked = false }) => {
  const [isChecked, setIsChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between px-4 py-3.5 text-white/90">
      <span className="font-medium">{label}</span>
      <button
        className={`relative h-7 w-12 rounded-full transition-colors ${isChecked ? 'bg-blue-500' : 'bg-white/20'}`}
        onClick={() => setIsChecked(!isChecked)}
        aria-checked={isChecked}
        role="switch"
      >
        <span
          className={`absolute top-1 block h-5 w-5 rounded-full bg-white shadow-md transition-transform ${
            isChecked ? 'left-6' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

const SliderItem: React.FC<SliderItemProps> = ({ label, defaultValue = 50 }) => {
  const [value, setValue] = useState(defaultValue)

  return (
    <div className="relative px-4 py-3.5 text-white/90">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-white/70">{value}%</span>
      </div>
      <div className="relative mt-3 h-1.5 w-full rounded-full bg-white/20">
        <div className="absolute left-0 top-0 h-1.5 rounded-full bg-blue-500" style={{ width: `${value}%` }} />
        <div
          className="absolute h-4 w-4 -translate-x-1/2 rounded-full bg-white shadow-md"
          style={{ left: `${value}%`, top: '-5px' }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="100"
        value={value}
        onChange={(e) => setValue(parseInt(e.target.value))}
        className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
      />
    </div>
  )
}

// Define types for screen components
interface ScreenProps {
  navigateTo: (screen: string) => void
}

// Define a Section component for grouping related settings
interface SectionProps {
  children: React.ReactNode
  className?: string
}

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

// Define screen components
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

const WorldSettings: React.FC<ScreenProps> = () => (
  <div className="space-y-4">
    <Section>
      <SliderItem label="Audio Volume" defaultValue={50} />
      <Divider />
      <ToggleItem label="Animation" defaultChecked />
      <Divider />
      <ToggleItem label="Vegetation" />
      <Divider />
      <ToggleItem label="Multiplayer" />
    </Section>
  </div>
)

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
      <ToggleItem label="Single Sign On" />
      <Divider />
      <ToggleItem label="Delete My Account" />
    </Section>
  </div>
)

const GraphicsSettings: React.FC<ScreenProps> = ({ navigateTo }) => (
  <div className="space-y-4">
    <Section>
      <SliderItem label="Quality Preset" defaultValue={60} />
      <Divider />
      <ToggleItem label="Post Processing" defaultChecked />
      <Divider />
      <ToggleItem label="Shadows" defaultChecked />
      <Divider />
      <MenuItem label="Shadow Map Resolution" onClick={() => navigateTo('shadowMapResolution')} hasChevron />
    </Section>
  </div>
)

// Define screen structure type
interface ScreenDefinition {
  component: React.ComponentType<ScreenProps>
  title: string
}

// Define placeholder screen component
const PlaceholderScreen: React.FC<ScreenProps & { title: string }> = ({ title }) => (
  <div className="p-2">{title} Settings</div>
)

// Define all screens
const screens: Record<string, ScreenDefinition> = {
  main: { component: MainMenu, title: 'Settings' },
  world: { component: WorldSettings, title: 'World' },
  account: { component: AccountSettings, title: 'Account' },
  graphics: { component: GraphicsSettings, title: 'Graphics' },
  shareSpace: {
    component: (props) => <PlaceholderScreen {...props} title="Share Space" />,
    title: 'Share Space'
  },
  avatar: {
    component: (props) => <PlaceholderScreen {...props} title="Avatar" />,
    title: 'Avatar'
  },
  controls: {
    component: (props) => <PlaceholderScreen {...props} title="Controls" />,
    title: 'Controls'
  },
  callTitle: {
    component: (props) => <PlaceholderScreen {...props} title="Call Title" />,
    title: 'Call Title'
  },
  usernamePassword: {
    component: (props) => <PlaceholderScreen {...props} title="Username & Password" />,
    title: 'Username & Password'
  },
  userId: {
    component: (props) => <PlaceholderScreen {...props} title="User ID" />,
    title: 'User ID'
  },
  permissions: {
    component: (props) => <PlaceholderScreen {...props} title="Permissions" />,
    title: 'Permissions'
  },
  shadowMapResolution: {
    component: (props) => <PlaceholderScreen {...props} title="Shadow Map Resolution" />,
    title: 'Shadow Map Resolution'
  }
}

interface SettingsMenuProps {
  onClose?: () => void
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onClose }) => {
  const [history, setHistory] = useState<string[]>(['main']) // Stack to keep track of navigation
  const [direction, setDirection] = useState<number>(1) // 1 for forward, -1 for backward

  const activeScreenKey = history[history.length - 1]
  const ActiveComponent = screens[activeScreenKey].component
  const currentTitle = screens[activeScreenKey].title

  const navigateTo = (screenKey: string): void => {
    setDirection(1)
    setHistory([...history, screenKey])
  }

  const navigateBack = (): void => {
    if (history.length > 1) {
      setDirection(-1)
      setHistory(history.slice(0, -1))
    } else {
      onClose?.() // Optional chaining in case onClose is not provided
    }
  }

  // Animation variants for slide transitions
  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/20 pt-10 backdrop-blur-md md:items-center md:pt-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex w-full max-w-sm flex-col rounded-3xl p-5 text-white shadow-xl backdrop-blur-md"
        style={{
          maxHeight: '90vh',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.05))',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(255, 255, 255, 0.08)'
        }}
      >
        {/* Header */}
        <div className="mb-4 flex h-10 items-center justify-between">
          {history.length > 1 ? (
            <button
              onClick={navigateBack}
              className="-ml-1 rounded-full p-2 transition-colors hover:bg-white/10"
              aria-label="Back"
            >
              <ArrowLeftSm className="text-white/90" />
            </button>
          ) : (
            <div className="w-8"></div> // Placeholder for spacing
          )}
          <h2 className="text-xl font-semibold text-white/90">{currentTitle}</h2>
          <button
            onClick={onClose}
            className="-mr-1 rounded-full p-2 transition-colors hover:bg-white/10"
            aria-label="Close settings"
          >
            <XCloseSm className="text-white/90" />
          </button>
        </div>

        {/* Screen Content with AnimatePresence for transitions */}
        <div className="relative overflow-hidden">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={activeScreenKey}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'spring', stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="max-h-[70vh] space-y-4 overflow-y-auto pb-4"
            >
              <ActiveComponent navigateTo={navigateTo} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default SettingsMenu

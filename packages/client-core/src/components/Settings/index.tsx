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

import { AnimatePresence, motion, Variant } from 'motion/react'
import React, { useState } from 'react'

// Import icons from the icons module
import { ArrowLeftSm, XCloseSm } from '@ir-engine/ui/src/icons'
// Define types for screen components
interface ScreenProps {
  navigateTo: (screen: string) => void
  onClose?: () => void
}

// Import main screen components
import AccountSettings from './AccountSettings'
import GraphicsSettings from './GraphicsSettings'
import MainMenu from './MainMenu'
import WorldSettings from './WorldSettings'

// Import other screen components
import AvatarScreen from './AvatarScreen'
import DeleteAccountScreen from './DeleteAccountScreen'
import DisplayNameScreen from './DisplayNameScreen'
import PermissionsScreen from './PermissionsScreen'
import ShareSpaceScreen from './ShareSpaceScreen'
import SSOScreen from './SSOScreen'
import UsernamePasswordScreen from './UsernamePasswordScreen'

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
    component: ShareSpaceScreen,
    title: 'Share Space'
  },
  avatar: {
    component: AvatarScreen,
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
    component: UsernamePasswordScreen,
    title: 'Username & Password'
  },
  userId: {
    component: (props) => <PlaceholderScreen {...props} title="User ID" />,
    title: 'User ID'
  },
  permissions: {
    component: PermissionsScreen,
    title: 'Permissions'
  },
  shadowMapResolution: {
    component: (props) => <PlaceholderScreen {...props} title="Shadow Map Resolution" />,
    title: 'Shadow Map Resolution'
  },
  sso: {
    component: SSOScreen,
    title: 'Single Sign On'
  },
  displayName: {
    component: DisplayNameScreen,
    title: 'Display Name'
  },
  deleteAccount: {
    component: DeleteAccountScreen,
    title: 'Delete My Account'
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
  const variants: Record<string, Variant> = {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/20 backdrop-blur-md md:items-center md:pt-0">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="flex h-full w-full max-w-sm flex-col rounded-3xl p-5 font-dm-sans text-white shadow-xl backdrop-blur-md md:max-w-screen-md"
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
          <h2 className=" text-xl font-semibold text-white/90">{currentTitle}</h2>
          <button
            onClick={onClose}
            className="-mr-1 rounded-full p-2 transition-colors hover:bg-white/10"
            aria-label="Close settings"
          >
            <XCloseSm className="text-white/90" />
          </button>
        </div>

        {/* Screen Content with AnimatePresence for transitions */}
        <div className="relative h-full overflow-hidden rounded-md">
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.div
              key={activeScreenKey}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: 'tween', duration: 0.2 },
                opacity: { duration: 0.2 }
              }}
              className="h-full max-h-full space-y-4 overflow-y-auto pb-4"
            >
              <ActiveComponent navigateTo={navigateTo} onClose={onClose} />
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

export default SettingsMenu

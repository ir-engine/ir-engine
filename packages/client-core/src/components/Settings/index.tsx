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
import React from 'react'

// Import icons from the icons module
// Define types for screen components
interface ScreenProps {
  navigateTo: (screenKey: string, historyKey: string) => void
  navigateClose?: () => void
}

// Import main screen components
import AccountSettings from './AccountSettings'
import GraphicsSettings from './GraphicsSettings'
import MainMenu from './MainMenu'
import WorldSettings from './WorldSettings'

// Import other screen components
import { useNavigationProvider } from '../Glass/NavigationProvider'
import AvatarScreen from './AvatarScreen'
import DeleteAccountScreen from './DeleteAccountScreen'
import DisplayNameScreen from './DisplayNameScreen'
import PermissionsScreen from './PermissionsScreen'
import ShareSpaceScreen from './ShareSpaceScreen'
import SignUpScreen from './SignUpScreen'
import SSOScreen from './SSOScreen'

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
export const screens: Record<string, ScreenDefinition> = {
  main: { component: MainMenu, title: 'Settings' },
  world: { component: WorldSettings, title: 'World' },
  account: { component: AccountSettings, title: 'Account' },
  graphics: { component: GraphicsSettings, title: 'Graphics' },
  signup: {
    title: 'Sign Up',
    component: SignUpScreen
  },
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
  displayName: {
    component: DisplayNameScreen,
    title: 'Display Name'
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
  deleteAccount: {
    component: DeleteAccountScreen,
    title: 'Delete My Account'
  }
}

interface SettingsMenuProps {
  onClose?: () => void
  initScreen?: string
}

const SettingsMenu: React.FC<SettingsMenuProps> = ({ initScreen = 'main' }) => {
  const { activeHistoryKey, direction, navigateBack, navigateTo, navigateClose } = useNavigationProvider()

  const ActiveComponent = screens[activeHistoryKey || initScreen].component

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
    <div data-testid="settings-menu-backdrop" id="settings-menu-backdrop" className="h-full w-full">
      <AnimatePresence initial={false} mode="popLayout" custom={direction}>
        <motion.div
          key={activeHistoryKey}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: 'tween', duration: 0.2 },
            opacity: { duration: 0.2 }
          }}
          className={`
                scrollbar-hide
                h-full
              `}
        >
          <ActiveComponent navigateTo={navigateTo} navigateClose={navigateClose} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default SettingsMenu

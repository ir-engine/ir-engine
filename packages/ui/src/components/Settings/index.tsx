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
  <div
    className="flex cursor-pointer items-center justify-between rounded-xl bg-white/10 p-4 shadow-sm backdrop-blur-sm"
    onClick={onClick}
  >
    <span className="font-medium">{label}</span>
    {hasChevron && <ChevronRightSm className="text-white/70" />}
  </div>
)

const ToggleItem: React.FC<ToggleItemProps> = ({ label, defaultChecked = false }) => {
  const [isChecked, setIsChecked] = useState(defaultChecked)

  return (
    <div className="flex items-center justify-between rounded-xl bg-white/10 p-4 shadow-sm backdrop-blur-sm">
      <span className="font-medium">{label}</span>
      <button
        className={`relative h-6 w-12 rounded-full transition-colors ${isChecked ? 'bg-white' : 'bg-white/30'}`}
        onClick={() => setIsChecked(!isChecked)}
        aria-checked={isChecked}
        role="switch"
      >
        <span
          className={`absolute top-1 block h-4 w-4 rounded-full bg-blue-500 transition-transform ${
            isChecked ? 'left-7' : 'left-1'
          }`}
        />
      </button>
    </div>
  )
}

const SliderItem: React.FC<SliderItemProps> = ({ label, defaultValue = 50 }) => {
  const [value, setValue] = useState(defaultValue)

  // Create a relative container for the slider
  return (
    <div className="relative rounded-xl bg-white/10 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <span className="font-medium">{label}</span>
        <span className="text-sm text-white/80">{value}%</span>
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

// Define screen components
const MainMenu: React.FC<ScreenProps> = ({ navigateTo }) => (
  <div className="space-y-3">
    <MenuItem label="Share Space" onClick={() => navigateTo('shareSpace')} hasChevron />

    <ToggleItem label="Video Communication" defaultChecked />
    <ToggleItem label="Spatial Audio" />

    <SliderItem label="Mic Volume" defaultValue={30} />
    <SliderItem label="Audio Volume" defaultValue={70} />

    <MenuItem label="World" onClick={() => navigateTo('world')} hasChevron />
    <ToggleItem label="Multiplayer" />
    <MenuItem label="Account" onClick={() => navigateTo('account')} hasChevron />
    <MenuItem label="Avatar" onClick={() => navigateTo('avatar')} hasChevron />
    <MenuItem label="Controls" onClick={() => navigateTo('controls')} hasChevron />
    <MenuItem label="Call Title" onClick={() => navigateTo('callTitle')} hasChevron />
    <MenuItem label="Graphics" onClick={() => navigateTo('graphics')} hasChevron />

    <button className="w-full rounded-xl bg-white/10 py-3 font-medium text-white shadow-sm backdrop-blur-sm">
      Log Out
    </button>
  </div>
)

const WorldSettings: React.FC<ScreenProps> = () => (
  <div className="space-y-3">
    <SliderItem label="Audio Volume" defaultValue={50} />
    <ToggleItem label="Animation" defaultChecked />
    <ToggleItem label="Vegetation" />
    <ToggleItem label="Multiplayer" />
  </div>
)

const AccountSettings: React.FC<ScreenProps> = ({ navigateTo }) => (
  <div className="space-y-3">
    <MenuItem label="Username & Password" onClick={() => navigateTo('usernamePassword')} hasChevron />
    <MenuItem label="User ID" onClick={() => navigateTo('userId')} hasChevron />
    <MenuItem label="Permissions" onClick={() => navigateTo('permissions')} hasChevron />
    <ToggleItem label="Single Sign On" />
    <ToggleItem label="Delete My Account" />
  </div>
)

const GraphicsSettings: React.FC<ScreenProps> = ({ navigateTo }) => (
  <div className="space-y-3">
    <SliderItem label="Quality Preset" defaultValue={60} />
    <ToggleItem label="Post Processing" defaultChecked />
    <ToggleItem label="Shadows" defaultChecked />
    <MenuItem label="Shadow Map Resolution" onClick={() => navigateTo('shadowMapResolution')} hasChevron />
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
        className="flex w-full max-w-sm flex-col rounded-3xl bg-white/10 p-5 text-white shadow-xl backdrop-blur-md"
        style={{
          maxHeight: '90vh',
          background: 'linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
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
              className="max-h-[70vh] space-y-3 overflow-y-auto pb-4"
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

import React, { useState } from 'react'

// Helper components for icons
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="ml-2 h-5 w-5 text-indigo-300 group-hover:text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-indigo-300 group-hover:text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
  </svg>
)

const PencilIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-white"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
)

const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="mr-2 h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
    />
  </svg>
)

const ListItemLink = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => (
  <button
    onClick={onClick}
    className="group flex w-full items-center justify-between rounded-md px-2 py-3.5 text-left text-indigo-100 transition-colors duration-150 hover:bg-white/10"
  >
    <span>{children}</span>
    <ArrowRightIcon />
  </button>
)

const SettingsToggle = ({
  label,
  checked,
  onChange,
  info = false
}: {
  label: string
  checked: boolean
  onChange: () => void
  info?: boolean
}) => (
  <div className="mb-4 flex items-center justify-between">
    <label className="group flex items-center text-indigo-100">
      {label}
      {info && <InfoIcon />}
    </label>
    <button
      className={`relative h-6 w-10 rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        checked ? 'bg-blue-500' : 'bg-indigo-500'
      }`}
      onClick={onChange}
    >
      <span
        className={`absolute left-0.5 top-0.5 h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  </div>
)

const SettingsSlider = ({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  info = false
}: {
  label: string
  value: number
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void
  min?: number
  max?: number
  info?: boolean
}) => (
  <div className="mb-4">
    <label
      htmlFor={label.toLowerCase().replace(' ', '')}
      className="group mb-2 block flex items-center text-sm font-bold text-indigo-100"
    >
      {label}
      {info && <InfoIcon />}
    </label>
    <input
      type="range"
      id={label.toLowerCase().replace(' ', '')}
      className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-indigo-500 accent-blue-500"
      min={min}
      max={max}
      value={value}
      onChange={onChange}
    />
    <p className="mt-1 text-sm text-indigo-200">
      {value}
      {label.toLowerCase().includes('volume') || label.toLowerCase().includes('music') ? '%' : ''}
    </p>
  </div>
)

const SettingsMenu = () => {
  // Original states
  const [videoCommunication, setVideoCommunication] = useState(true)
  const [spatialAudio, setSpatialAudio] = useState(true)
  const [audioVolume, setAudioVolume] = useState(50)
  const [micVolume, setMicVolume] = useState(75)
  const [activeTab, setActiveTab] = useState('Audio')

  // World Tab states
  const [backgroundMusicVolume, setBackgroundMusicVolume] = useState(60)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)
  const [vegetationEnabled, setVegetationEnabled] = useState(true)
  const [multiplayerEnabled, setMultiplayerEnabled] = useState(false)

  // Graphics Tab states
  const [qualityPreset, setQualityPreset] = useState(3) // Example: 0-5
  const [postProcessingEnabled, setPostProcessingEnabled] = useState(true)
  const [shadowsEnabled, setShadowsEnabled] = useState(true)
  const [shadowMapResolution, setShadowMapResolution] = useState('Medium')

  const handleToggle = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setter((prev) => !prev)
  }

  const handleSliderChange = (
    setter: React.Dispatch<React.SetStateAction<number>>,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setter(parseInt(event.target.value, 10))
  }

  const handleTabClick = (tabName: string) => {
    setActiveTab(tabName)
  }

  return (
    <div className="fixed right-0 top-0 z-50 h-screen w-full translate-x-0 transform bg-gradient-to-br from-[#6075CB] to-[#4A55A2] shadow-xl transition-transform duration-300 ease-in-out sm:max-w-md">
      <div className="flex h-full flex-col">
        <div className="flex-shrink-0 px-6 py-8">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Settings</h2>
            <button className="text-indigo-200 hover:text-white focus:outline-none">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <button className="mb-4 flex w-full items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-2 font-semibold text-white hover:from-blue-600 hover:to-purple-700">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2 h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Share Space
          </button>

          <SettingsToggle
            label="Video Communication"
            checked={videoCommunication}
            onChange={() => handleToggle(setVideoCommunication)}
          />
        </div>

        <div className="mb-2 flex-shrink-0 px-6">
          <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {['Audio', 'World', 'Account', 'Avatar', 'Controls', 'Graphics'].map((tab) => (
              <button
                key={tab}
                className={`rounded-md px-3 py-2 text-sm transition-colors duration-150 ${
                  activeTab === tab
                    ? 'bg-white/20 font-semibold text-white'
                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                } focus:outline-none`}
                onClick={() => handleTabClick(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-24">
          {' '}
          {/* Added pb-24 for bottom nav space */}
          {activeTab === 'Audio' && (
            <div>
              <SettingsToggle
                label="Spatial Audio"
                checked={spatialAudio}
                onChange={() => handleToggle(setSpatialAudio)}
              />
              <SettingsSlider
                label="Audio Volume"
                value={audioVolume}
                onChange={(e) => handleSliderChange(setAudioVolume, e)}
              />
              <SettingsSlider
                label="Mic Volume"
                value={micVolume}
                onChange={(e) => handleSliderChange(setMicVolume, e)}
              />
            </div>
          )}
          {activeTab === 'World' && (
            <div>
              <SettingsSlider
                label="Background Music"
                value={backgroundMusicVolume}
                onChange={(e) => handleSliderChange(setBackgroundMusicVolume, e)}
              />
              <SettingsToggle
                label="Animations"
                checked={animationsEnabled}
                onChange={() => handleToggle(setAnimationsEnabled)}
                info
              />
              <SettingsToggle
                label="Vegetation"
                checked={vegetationEnabled}
                onChange={() => handleToggle(setVegetationEnabled)}
                info
              />
              <SettingsToggle
                label="Multiplayer"
                checked={multiplayerEnabled}
                onChange={() => handleToggle(setMultiplayerEnabled)}
              />
            </div>
          )}
          {activeTab === 'Account' && (
            <div>
              <div className="mb-6 flex justify-center">
                <img
                  src="https://via.placeholder.com/80"
                  alt="User Avatar"
                  className="h-20 w-20 rounded-full border-2 border-indigo-300 object-cover"
                />
              </div>
              <div className="space-y-1">
                <ListItemLink>Username & Password</ListItemLink>
                <ListItemLink>Username ID</ListItemLink>
                <ListItemLink>Permissions</ListItemLink>
                <ListItemLink>Linked Accounts</ListItemLink>
                <ListItemLink>SSO</ListItemLink>
                <ListItemLink>Delete My Account</ListItemLink>
              </div>
            </div>
          )}
          {activeTab === 'Avatar' && (
            <div className="flex flex-col items-center">
              <div className="relative mb-6 flex aspect-[3/4] w-full max-w-xs items-center justify-center rounded-lg bg-gradient-to-br from-teal-300 to-cyan-400">
                <img
                  src="https://via.placeholder.com/200x300.png?text=Your+Avatar"
                  alt="User Avatar"
                  className="max-h-full max-w-full object-contain"
                />
                <button className="absolute right-2 top-2 rounded-full bg-blue-500 p-2 shadow-md hover:bg-blue-600">
                  <PencilIcon />
                </button>
              </div>
              <button className="flex w-full max-w-xs items-center justify-center rounded-md bg-gradient-to-r from-blue-500 to-purple-600 px-4 py-3 font-semibold text-white hover:from-blue-600 hover:to-purple-700">
                <UploadIcon />
                Upload New Avatar
              </button>
            </div>
          )}
          {activeTab === 'Controls' && (
            <div className="text-indigo-100">
              <h3 className="mb-3 text-lg font-semibold">GRAPHICS OF THESE CONTROLS</h3>
              <ul className="mb-6 list-inside list-disc space-y-1 pl-2">
                <li>1ST PERSON CONTROLS</li>
                <li>3RD PERSON CONTROLS</li>
                <li>TOP-DOWN CONTROLS</li>
              </ul>
              <p className="text-sm text-indigo-200">NOTE: MAKE IT TOGGLABLE HERE AS WELL AS IN HOME SCREEN?</p>
            </div>
          )}
          {activeTab === 'Graphics' && (
            <div>
              <SettingsSlider
                label="Quality Present"
                value={qualityPreset}
                onChange={(e) => handleSliderChange(setQualityPreset, e)}
                min={0}
                max={5}
                info
              />
              <SettingsToggle
                label="Post Processing"
                checked={postProcessingEnabled}
                onChange={() => handleToggle(setPostProcessingEnabled)}
              />
              <SettingsToggle
                label="Shadows"
                checked={shadowsEnabled}
                onChange={() => handleToggle(setShadowsEnabled)}
              />

              <div className="mb-4">
                <label
                  htmlFor="shadowMapResolution"
                  className="group mb-2 block flex items-center text-sm font-bold text-indigo-100"
                >
                  Shadow Map Resolution <InfoIcon />
                </label>
                <div className="relative">
                  <select
                    id="shadowMapResolution"
                    value={shadowMapResolution}
                    onChange={(e) => setShadowMapResolution(e.target.value)}
                    className="w-full appearance-none rounded-md border-0 bg-indigo-500 px-3 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                    <option>Ultra</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-indigo-200">
                    <svg className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                      <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* Common Log Out Button */}
          <button className="mt-8 w-full rounded-md bg-gradient-to-r from-blue-500 to-purple-600 py-3 font-semibold text-white hover:from-blue-600 hover:to-purple-700">
            Log Out
          </button>
        </div>

        {/* Bottom Navigation */}
        <div className="fixed bottom-0 left-0 flex w-full flex-shrink-0 items-center justify-around border-t border-indigo-700 bg-[#4A55A2] px-4 py-3 sm:max-w-md">
          <button className="text-indigo-300 hover:text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
          </button>
          <button className="text-indigo-300 hover:text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
          <button className="text-blue-400 hover:text-blue-300 focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </button>
          <button className="text-indigo-300 hover:text-white focus:outline-none">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default SettingsMenu

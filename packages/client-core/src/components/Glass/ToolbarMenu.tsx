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

import React, { useState } from 'react'

import { ChevronDownMd, ChevronLeftMd, CogMd, EmoteM, MessageTextSquare01Sm } from '@ir-engine/ui/src/icons'
import { useTranslation } from 'react-i18next'
import { twMerge } from 'tailwind-merge'
import { ModalState } from '../../common/services/ModalState'
import Settings from '../Settings'
import { Badge } from './Badge'
import { MenuButton } from './MenuButton'
import { MultimediaStateProvider, useMultimediaStateProvider } from './MultimediaStateProvider'

export const ChatButton = ({ onClick, active }) => {
  return (
    <MenuButton onClick={onClick} active={active}>
      <MessageTextSquare01Sm className={'relative top-[0.04em]'} />
    </MenuButton>
  )
}

export const MicButton = () => {
  const { onMicClick, _MicIcon, isMicReady } = useMultimediaStateProvider()

  return isMicReady ? (
    <MenuButton onClick={onMicClick}>
      <_MicIcon />
    </MenuButton>
  ) : (
    <></>
  )
}

export const CamButton = () => {
  const { onCamClick, _CamIcon, isCamReady, isCamLoading } = useMultimediaStateProvider()

  return isCamReady ? (
    <MenuButton loading={isCamLoading} onClick={onCamClick}>
      <_CamIcon />
    </MenuButton>
  ) : (
    <></>
  )
}

export const ScreenshareButton = () => {
  const { onScreenshareClick, _ScreenshareIcon, isScreenshareReady } = useMultimediaStateProvider()

  return isScreenshareReady ? (
    <MenuButton onClick={onScreenshareClick}>
      <_ScreenshareIcon />
    </MenuButton>
  ) : (
    <></>
  )
}

export const MultiVideoButton = () => {
  const { onMultiVideoClick, _MultiVideoIcon, isMultiVideoReady } = useMultimediaStateProvider()

  return isMultiVideoReady ? (
    <MenuButton
      tooltip={{
        title: 'user:menu.cycleCamera',
        position: 'left'
      }}
      onClick={onMultiVideoClick}
    >
      <_MultiVideoIcon />
    </MenuButton>
  ) : (
    <></>
  )
}

export const VRButton = () => {
  const { t } = useTranslation()

  const { onVRClick, _VRIcon, isVRReady } = useMultimediaStateProvider()

  return isVRReady ? (
    <MenuButton
      tooltip={{
        title: 'user:menu.enterVR',
        position: 'left'
      }}
      onClick={onVRClick}
    >
      <_VRIcon />
    </MenuButton>
  ) : (
    <></>
  )
}

export const Divider = () => {
  return (
    <div className={'relative grid h-full w-full items-center px-2 py-0 sm:max-lg:w-auto sm:max-lg:px-5'}>
      <div className={'h-[2px] w-full rounded-full bg-white sm:max-lg:h-6 sm:max-lg:w-[2px]'} />
    </div>
  )
}

export const VerticalMenu = ({ children }) => {
  return (
    <div
      className={`
        visible absolute

        -left-6
        top-1/2
        z-10
        -translate-x-full
        
        -translate-y-1/2
        sm:max-lg:collapse
      `}
    >
      {children}
    </div>
  )
}

export const HorizontalMenu = ({ children }) => {
  return (
    <div
      className={`
        pointer-events-auto

        absolute left-1/2
        right-auto
        top-6
        z-10
        hidden
        -translate-x-1/2
        
        translate-y-0
        sm:max-lg:block
      `}
    >
      {children}
    </div>
  )
}

export const containerStyles = `
  relative
  
  inline-flex
  
  translate-z
  transform-gpu
  
  rounded-full
  border-y-2 border-white/5
  bg-black/[0.05]
  
  shadow-[0_0.1rem_2.3rem_-0.5rem_hsla(0,0%,0%,0.15)]
  backdrop-blur-xl transition-transform

  delay-[60ms]
  hover:scale-[1.03]
`

export const gridStyles_base = `
  relative
  flex items-center

  text-[1.8rem]
  text-white
`

const gridStyles = `
  ${gridStyles_base}
  flex-col
  py-4

  sm:max-lg:flex-row
  sm:max-lg:flex-row-reverse
  sm:max-lg:gap-x-3
  sm:max-lg:px-5
  sm:max-lg:py-1
  sm:max-lg:pl-6
`

export const sectionStyles_base = `
  flex items-center
  gap-7 pb-2
`

const sectionStyles = `
  ${sectionStyles_base}
  flex-col
  px-3 pt-6

  sm:max-lg:flex-row
  sm:max-lg:px-0
  sm:max-lg:pt-2
`

const collapsableSectionBaseStyles = `
  inline-flex flex-col items-center origin-bottom
  gap-7 px-3
  
  transition-all
  
  sm:max-lg:origin-left
  sm:max-lg:flex-row
  sm:max-lg:px-0
`

const collapsableSectionOpenStyles = `
  sm:max-lg:max-h-auto
  max-h-screen
  py-5
  pb-7
  
  sm:max-lg:max-w-full
  sm:max-lg:py-0 sm:max-lg:pr-2
`

const collapsableSectionCloseStyles = `
  max-h-0
  scale-y-0
  
  sm:max-lg:max-w-0
  sm:max-lg:scale-x-0  
`

export const ToolbarMenu = ({ onMessageClick, onShareClick, activeKey }) => {
  const hasNotifications = true
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className={containerStyles}>
      <div className={gridStyles}>
        <Badge show={hasNotifications} />

        <MenuButton onClick={() => setIsMenuOpen((prev) => !prev)}>
          <ChevronDownMd className={twMerge(isMenuOpen ? `scale-[1.2]` : `-scale-[1.2]`, 'sm:max-lg:hidden')} />
          <ChevronLeftMd className={twMerge(isMenuOpen ? `scale-[1.2]` : `-scale-[1.2]`, 'hidden sm:max-lg:block')} />
        </MenuButton>

        <div
          className={twMerge(
            collapsableSectionBaseStyles,
            isMenuOpen ? collapsableSectionOpenStyles : collapsableSectionCloseStyles
          )}
        >
          <MenuButton onClick={() => ModalState.openModal(<Settings onClose={ModalState.closeModal} />)}>
            <CogMd />
          </MenuButton>
          <MenuButton onClick={onShareClick} badge={{ number: 1 }}>
            <EmoteM className={'relative sm:max-lg:-top-[0.075em]'} />
          </MenuButton>
        </div>

        {isMenuOpen && <Divider />}

        <div className={sectionStyles}>
          <ChatButton active={activeKey === `Chat`} onClick={onMessageClick} />
          <MultimediaStateProvider>
            <MicButton />
            <CamButton />
            <MultiVideoButton />
            <ScreenshareButton />
            <VRButton />
          </MultimediaStateProvider>
        </div>
      </div>
    </div>
  )
}

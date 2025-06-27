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

import { ChevronLeftMd, XCloseLg } from '@ir-engine/ui/src/icons'
import { twMerge } from 'tailwind-merge'
import { IconButton } from './buttons/IconButton'
import { MenuIconButton } from './buttons/MenuIconButton'
import { HorizontalMenu, VerticalMenu } from './ToolbarMenu'

type TabProps = {
  heading: string
  active?: boolean
  onClick: () => void
}

type HeaderProps = {
  title: string
  tabs?: TabProps[]
  handleSidebarClose: () => void
  handleSidebarBack: () => void
  showBack: boolean
}

type ToolbarAndSidebarProps = HeaderProps & {
  toolbar: React.ReactNode
  content: React.ReactNode
  isSidebarOpen: boolean
}

const containerStyles = `
  pointer-events-auto
  
  absolute z-20
  bottom-0 right-0 top-0

  inline-grid
  
  transition-transform
`

const sidebarContainerStyles = `
  inline-grid
  grid-rows-[min-content_min-content_1fr]
  content-start
  
  max-h-full
  h-full
  
  border-l-2
  border-white/10
  shadow-[0_0.1rem_2.3rem_-0.5rem_hsla(0,0%,0%,0.1)]
  backdrop-blur-3xl
`

const headerContainerStyles = `
  flex
  items-start
  px-6
  text-white
  
  
  lg:pb-0 lg:pr-8
  lg:pt-8
`

const headerInnerStyles = `
  relative
  inline-grid
  w-full
`

const buttonContainer_base = `
  absolute z-10
  top-1/2

  inline-flex items-center
  -translate-y-1/2

  lg:bottom-auto
  lg:top-0
  lg:translate-y-0
`

const closeButtonStyles = `
  right-0
`

const backButtonStyles = `
  left-0
  
  lg:hidden
`

const Tab = ({ onClick, heading, active }: TabProps) => {
  return (
    <button className={`group`} onClick={onClick}>
      <h2 className={`lg:text-shadow-md grid gap-y-1`}>
        {heading}
        <div
          className={twMerge(
            `h-[0.14em] w-full rounded-full group-hover:bg-white/80 lg:h-[0.08em]`,
            active ? `bg-white/80 lg:bg-white/90 lg:shadow-md` : `bg-transparent`
          )}
        />
      </h2>
    </button>
  )
}

const headingsStyles = `
  flex items-center justify-center

  gap-x-8
  py-8
  text-2xl
  
  lg:justify-start
  lg:py-4
  lg:pl-2
  lg:text-5xl
  lg:gap-x-8
`

const headerBackButtonStyles = `
  hidden
  lg:block
`

const Header = ({ tabs = [], title, handleSidebarClose, handleSidebarBack, showBack }: HeaderProps) => {
  const backButton = (
    <IconButton size={'small'} onClick={handleSidebarBack}>
      <ChevronLeftMd />
    </IconButton>
  )

  const hasTabs = !!tabs.length

  return (
    <div className={headerContainerStyles}>
      <div className={headerInnerStyles}>
        {showBack ? <div className={twMerge(buttonContainer_base, backButtonStyles)}>{backButton}</div> : <></>}
        <div className={twMerge(buttonContainer_base, closeButtonStyles)}>
          <MenuIconButton className={`text-3xl`} onClick={handleSidebarClose}>
            <XCloseLg />
          </MenuIconButton>
        </div>
        <div style={{ textShadow: `0 0.025em 0.08em hsla(0, 0%, 0%, 0.2)` }} className={headingsStyles}>
          {showBack ? <div className={headerBackButtonStyles}>{backButton}</div> : <></>}
          {hasTabs ? (
            tabs.map((tabProps) => {
              return <Tab {...tabProps} />
            })
          ) : (
            <h2 className={twMerge(`lg:block`, tabs.length ? `hidden` : ``)}>{title}</h2>
          )}
        </div>
      </div>
    </div>
  )
}

const contentStyles = `
  absolute z-0
  inset-0

  flex flex-col items-center
  gap-y-7

  text-xl
  text-white

  scrollbar-hide
  overflow-y-auto
`

export const innerStyles = `
  px-6 pt-0 pb-12

  lg:px-14
  lg:pt-12
`

export const Inner = ({ className, ...props }) => <div className={twMerge(innerStyles, className)} {...props} />

const contentContainerStyles = `
  relative

  before:content-[' '] 
  before:absolute
  before:left-0
  before:right-0
  before:top-0
  before:z-10
  before:h-0
  before:bg-gradient-to-b
  before:from-black/5
  before:to-transparent
  before:opacity-40

  lg:before:h-12
`

const contentFakeSpacer = `
  w-screen
  max-w-3xl
  
  lg:min-w-[42rem]
  sm:max-lg:max-w-full
`

export const ToolbarAndSidebar = ({
  toolbar,
  content,
  title,
  tabs = [],
  handleSidebarClose,
  handleSidebarBack,
  showBack,
  isSidebarOpen
}: ToolbarAndSidebarProps) => {
  tabs = (tabs as TabProps[]) || [{ heading: title } as TabProps]

  return (
    <>
      <div className={twMerge(containerStyles, isSidebarOpen ? `translate-x-0` : `translate-x-full`)}>
        <VerticalMenu>{toolbar}</VerticalMenu>
        <div className={sidebarContainerStyles}>
          <Header
            tabs={tabs}
            title={title}
            showBack={showBack}
            handleSidebarClose={handleSidebarClose}
            handleSidebarBack={handleSidebarBack}
          />
          <div className={`h-[2px] lg:bg-white/10`} />
          <div className={contentContainerStyles}>
            <div className={contentFakeSpacer} />
            <div id="settings-menu-content" className={contentStyles}>
              {content}
            </div>
          </div>
        </div>
      </div>
      <HorizontalMenu>{toolbar}</HorizontalMenu>
    </>
  )
}

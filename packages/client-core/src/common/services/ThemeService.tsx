/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and
provide for limited attribution for the Original Developer. In addition,
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023
Ethereal Engine. All Rights Reserved.
*/

import { defineState, getMutableState, syncStateWithLocalStorage, useMutableState } from '@etherealengine/hyperflux'

import { useEffect } from 'react'

export interface CSSClasses {
  'bg-primary': string
  'bg-secondary': string
  'bg-highlight': string
  'bg-surface-bg': string
  'bg-surface-main': string
  'bg-surface-dropdown': string
  'bg-surface-input': string
  'bg-surface-card': string
  'bg-table-secondary': string
  'bg-blue-secondary': string
  'bg-studio-surface': string
  'bg-banner-informative': string

  'bg-tag-green': string
  'bg-tag-lime': string
  'bg-tag-red': string
  'bg-tag-yellow': string

  'text-input': string
  'text-primary': string
  'text-secondary': string
  'text-highlight': string
  'text-gray3': string
  'text-menu-default': string

  'icon-green': string
  'icon-red': string

  'border-primary': string
  'border-input': string
  'border-focus': string

  'blue-primary': string
  selection: string
}

const lightTheme: CSSClasses = {
  'bg-primary': '#F5F5F5',
  'bg-secondary': '#FFFFFF',
  'bg-highlight': '#D9D9D9',
  'bg-surface-bg': '#FFFFFF',
  'bg-surface-main': '#FFFFFF',
  'bg-surface-dropdown': '#FFFFFF',
  'bg-surface-input': '#FFFFFF',
  'bg-surface-card': '#FFFFFF',
  'bg-table-secondary': '#F9FAFB',
  'bg-blue-secondary': '#D4DFF7',
  'bg-studio-surface': '#F5F5F5',
  'bg-banner-informative': '#FFFBEB',

  'bg-tag-green': '#10B981',
  'bg-tag-lime': '#9ACD32',
  'bg-tag-red': '#D1004B',
  'bg-tag-yellow': '#FEF3C7',

  'text-input': '#9CA0AA',
  'text-primary': '#262626',
  'text-secondary': '#6B7280',
  'text-highlight': '#000000',
  'text-gray3': '#D3D5D9',
  'text-menu-default': '#9CA0AA',

  'icon-green': '#0D9488 ',
  'icon-red': '#E11D48',

  'border-primary': '#E5E7EB',
  'border-input': '#42454D',
  'border-focus': '#375DAF',

  'blue-primary': '#375DAF',
  selection: '#3166D0'
}

const darkTheme: CSSClasses = {
  'bg-primary': '#111113',
  'bg-secondary': '#000000',
  'bg-highlight': '#212226',
  'bg-surface-bg': '#080808',
  'bg-surface-main': '#1A1B1E',
  'bg-surface-dropdown': '#141619',
  'bg-surface-input': '#141619',
  'bg-surface-card': '#292a2c',
  'bg-table-secondary': '#212226',
  'bg-blue-secondary': '#2A3753',
  'bg-studio-surface': '#191B1F',
  'bg-banner-informative': '#D9770633',

  'bg-tag-green': '#064E3B',
  'bg-tag-lime': '#9ACD32',
  'bg-tag-red': '#B30911',
  'bg-tag-yellow': '#CA8A04',

  'text-input': '#9CA0AA',
  'text-primary': '#F5F5F5',
  'text-secondary': '#D4D4D4',
  'text-highlight': '#FFFFFF',
  'text-gray3': '#D3D5D9',
  'text-menu-default': '#9CA0AA',

  'icon-green': '#0D9488 ',
  'icon-red': '#FB7185',

  'border-primary': '#2B2C30',
  'border-input': '#42454D',
  'border-focus': '#375DAF',

  'blue-primary': '#375DAF',
  selection: '#1E4273'
}

export const themes: Record<string, Partial<CSSClasses>> = {
  light: lightTheme,
  dark: darkTheme,
  custom: {}
}

export const ThemeState = defineState({
  name: 'ThemeState',
  initial: {
    theme: 'dark' as 'light' | 'dark' | 'custom'
  },

  setTheme: (theme: 'light' | 'dark' | 'custom') => {
    getMutableState(ThemeState).theme.set(theme)
  },

  extension: syncStateWithLocalStorage(['theme'])
})

export const updateTheme = (themeClasses: Partial<CSSClasses>) => {
  if (themeClasses) {
    const root = document.querySelector(':root') as any
    for (const variable of Object.keys(themeClasses)) {
      root.style.setProperty('--' + variable, themeClasses[variable])
    }
  }
}

export const useThemeProvider = () => {
  const themeState = useMutableState(ThemeState)
  const themeClasses = themes[themeState.theme.value]

  useEffect(() => {
    updateTheme(themeClasses)
  }, [])

  useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.setAttribute('data-theme', themeState.theme.value)
      updateTheme(themeClasses)
    }
  }, [themeState.theme])
}

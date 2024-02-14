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

import { useHookstate } from '@hookstate/core'
import React, { useEffect } from 'react'

import { defineState, getMutableState } from '@etherealengine/hyperflux'

const lightTheme = {
  'bg-primary': '#F5F5F5',
  'bg-secondary': '#FFFFFF',
  'bg-highlight': '#FFFFFF',
  'text-primary': '#262626',
  'text-secondary': '#6B7280',
  'text-highlight': '#FFFFFF'
}

const darkTheme = {
  'bg-primary': '#111113',
  'bg-secondary': '#1A1B1E',
  'bg-highlight': '#212226',
  'text-primary': '#F5F5F5',
  'text-secondary': '#D4D4D4',
  'text-highlight': '#FFFFFF'
}

const themes = {
  light: lightTheme,
  dark: darkTheme,
  custom: {}
}

export const ThemeState = defineState({
  name: 'ThemeState',
  initial: {
    theme: 'light' as 'light' | 'dark' | 'custom'
  },

  setTheme: (theme: 'light' | 'dark' | 'custom') => {
    getMutableState(ThemeState).theme.set(theme)
  }
})

export const ThemeProvider = ({ children }) => {
  const themeState = useHookstate(getMutableState(ThemeState))

  useEffect(() => {
    updateTheme()
  }, [])

  useEffect(() => {
    const html = document.querySelector('html')
    if (html) {
      html.setAttribute('data-theme', themeState.theme.value)
      updateTheme()
    }
  }, [themeState.theme])

  const updateTheme = () => {
    const theme = themes[themeState.theme.value]
    if (theme) {
      const root = document.querySelector(':root') as any
      for (const variable of Object.keys(theme)) {
        root.style.setProperty('--' + variable, theme[variable])
      }
    }
  }

  return <>{children}</>
}

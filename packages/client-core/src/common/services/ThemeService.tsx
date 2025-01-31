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

import { defineState, getMutableState, syncStateWithLocalStorage, useMutableState } from '@ir-engine/hyperflux'

import { useEffect } from 'react'

export interface CSSClasses {}

const lightTheme: CSSClasses = {}

const darkTheme: CSSClasses = {}

export const themes: Record<string, Partial<CSSClasses>> = {
  light: lightTheme,
  dark: darkTheme
}

export const ThemeState = defineState({
  name: 'ThemeState',
  initial: {
    theme: 'dark' as 'light' | 'dark'
  },

  setTheme: (theme: 'light' | 'dark') => {
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

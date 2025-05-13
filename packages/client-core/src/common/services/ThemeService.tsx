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

export interface CSSClasses {
  /* Surface Colors */
  '--surface-0': string
  '--surface-1': string
  '--surface-2': string
  '--surface-3': string
  '--surface-4': string
  '--surface-error': string
  '--surface-warning': string
  '--surface-success': string

  /* Surface Outline */
  '--surface-outline-1-1': string
  '--surface-outline-2-1': string
  '--surface-outline-3-1': string
  '--surface-outline-4-1': string
  '--surface-outline-5-1': string

  /* UI Elements / Default */
  '--ui-background': string
  '--ui-outline': string
  '--ui-primary': string
  '--ui-secondary': string
  '--ui-tertiary': string
  '--ui-quadrary': string
  '--ui-error': string
  '--ui-warning': string
  '--ui-success': string

  /* UI Elements / Hover */
  '--ui-hover-background': string
  '--ui-hover-outline': string
  '--ui-hover-primary': string
  '--ui-hover-secondary': string
  '--ui-hover-tertiary': string
  '--ui-hover-quadrary': string
  '--ui-hover-error': string
  '--ui-hover-warning': string
  '--ui-hover-success': string

  /* UI Elements / Select */
  '--ui-select-background': string
  '--ui-select-outline': string
  '--ui-select-primary': string
  '--ui-select-secondary': string
  '--ui-select-tertiary': string
  '--ui-select-quadrary': string
  '--ui-select-error': string
  '--ui-select-warning': string
  '--ui-select-success': string

  /* UI Elements / Inactive */
  '--ui-inactive-background': string
  '--ui-inactive-outline': string
  '--ui-inactive-primary': string
  '--ui-inactive-secondary': string
  '--ui-inactive-tertiary': string
  '--ui-inactive-quadrary': string
  '--ui-inactive-error': string
  '--ui-inactive-warning': string
  '--ui-inactive-success': string

  /* Text Colors */
  '--text-primary-button': string
  '--text-primary': string
  '--text-secondary': string
  '--text-tertiary': string
  '--text-inactive': string
  '--text-link': string
  '--text-error': string
  '--text-warning': string
  '--text-success': string

  /* Chart Colors */
  '--chart-100': string
  '--chart-200': string
  '--chart-300': string
  '--chart-400': string
  '--chart-500': string
  '--chart-600': string
  '--chart-700': string
  '--chart-800': string
  '--chart-900': string
  '--chart-1000': string
  '--chart-1100': string
  '--chart-1200': string
  '--chart-1300': string
}

const lightTheme: CSSClasses = {
  /* Surface Colors */
  '--surface-0': '#DBDBDB',
  '--surface-1': '#E6E6E6',
  '--surface-2': '#EBEBEB',
  '--surface-3': '#F0F0F0',
  '--surface-4': '#F5F5F5',
  '--surface-error': '#CE2C2C',
  '--surface-warning': '#FFDB6E',
  '--surface-success': '#6AC689',

  /* Surface Outline */
  '--surface-outline-1-1': '#D1D1D1',
  '--surface-outline-2-1': '#DBDBDB',
  '--surface-outline-3-1': '#E0E0E0',
  '--surface-outline-4-1': '#EBEBEB',
  '--surface-outline-5-1': '#4F5259',

  /* UI Elements / Default */
  '--ui-background': '#EBEBEB',
  '--ui-outline': '#B2B5BD',
  '--ui-primary': '#4D84BF',
  '--ui-secondary': '#7487A0',
  '--ui-tertiary': '#DDE1E5',
  '--ui-quadrary': '#C6CBD1',
  '--ui-error': '#BD3131',
  '--ui-warning': '#D8AB32',
  '--ui-success': '#2C914E',

  /* UI Elements / Hover */
  '--ui-hover-background': '#DBDBDB',
  '--ui-hover-outline': '#E6E6E6',
  '--ui-hover-primary': '#3368A1',
  '--ui-hover-secondary': '#3771AF',
  '--ui-hover-tertiary': '#EDEFF1',
  '--ui-hover-quadrary': '#DDE1E5',
  '--ui-hover-error': '#D14D4D',
  '--ui-hover-warning': '#EEBA19',
  '--ui-hover-success': '#5AC97F',

  /* UI Elements / Select */
  '--ui-select-background': '#F0F0F0',
  '--ui-select-outline': '#DBDBDB',
  '--ui-select-primary': '#3C6399',
  '--ui-select-secondary': '#214469',
  '--ui-select-tertiary': '#E6E6E6',
  '--ui-select-quadrary': '#E0E0E0',
  '--ui-select-error': '#A82D2D',
  '--ui-select-warning': '#EEBA19',
  '--ui-select-success': '#18863D',

  /* UI Elements / Inactive */
  '--ui-inactive-background': '#E6E6E6',
  '--ui-inactive-outline': '#E0E0E0',
  '--ui-inactive-primary': '#8CB6E2',
  '--ui-inactive-secondary': '#B4CFEC',
  '--ui-inactive-tertiary': '#E6E6E6',
  '--ui-inactive-quadrary': '#E0E0E0',
  '--ui-inactive-error': '#FF8282',
  '--ui-inactive-warning': '#FFDB6E',
  '--ui-inactive-success': '#ADE5C0',

  /* Text Colors */
  '--text-primary-button': '#F7F8FA',
  '--text-primary': '#2C2E33',
  '--text-secondary': '#5A5E66',
  '--text-tertiary': '#7C808A',
  '--text-inactive': '#B2B5BD',
  '--text-link': '#5F8DBF',
  '--text-error': '#CE2C2C',
  '--text-warning': '#EEBA19',
  '--text-success': '#29CF60',

  /* Chart Colors */
  '--chart-100': '#FDA4AF',
  '--chart-200': '#C78FB4',
  '--chart-300': '#A24482',
  '--chart-400': '#F43F5E',
  '--chart-500': '#FDE047',
  '--chart-600': '#CA8A04',
  '--chart-700': '#A7F3D0',
  '--chart-800': '#34D399',
  '--chart-900': '#10B981',
  '--chart-1000': '#879ECF',
  '--chart-1100': '#375DAF',
  '--chart-1200': '#A188DE',
  '--chart-1300': '#6943C6'
}

const darkTheme: CSSClasses = {
  /* Surface Colors */
  '--surface-0': '#070708',
  '--surface-1': '#0F1012',
  '--surface-2': '#16191C',
  '--surface-3': '#1F2126',
  '--surface-4': '#23262B',
  '--surface-error': '#31140D',
  '--surface-warning': '#C4901F',
  '--surface-success': '#2C914E',

  /* Surface Outline */
  '--surface-outline-1-1': '#1F2126',
  '--surface-outline-2-1': '#23262B',
  '--surface-outline-3-1': '#272A30',
  '--surface-outline-4-1': '#2C2E33',
  '--surface-outline-5-1': '#9CA0AA',

  /* UI Elements / Default */
  '--ui-background': '#16191C',
  '--ui-outline': '#42454D',
  '--ui-primary': '#3771AF',
  '--ui-secondary': '#1B2F44',
  '--ui-tertiary': '#42454D',
  '--ui-quadrary': '#2C2E33',
  '--ui-error': '#732424',
  '--ui-warning': '#A67A28',
  '--ui-success': '#11632C',

  /* UI Elements / Hover */
  '--ui-hover-background': '#1F2126',
  '--ui-hover-outline': '#42454D',
  '--ui-hover-primary': '#4D84BF',
  '--ui-hover-secondary': '#214469',
  '--ui-hover-tertiary': '#5A5E66',
  '--ui-hover-quadrary': '#42454D',
  '--ui-hover-error': '#A82D2D',
  '--ui-hover-warning': '#D8AB32',
  '--ui-hover-success': '#2C914E',

  /* UI Elements / Select */
  '--ui-select-background': '#1F2126',
  '--ui-select-outline': '#616161',
  '--ui-select-primary': '#3368A1',
  '--ui-select-secondary': '#16263B',
  '--ui-select-tertiary': '#42454D',
  '--ui-select-quadrary': '#2C2E33',
  '--ui-select-error': '#962E2E',
  '--ui-select-warning': '#C4901F',
  '--ui-select-success': '#18863D',

  /* UI Elements / Inactive */
  '--ui-inactive-background': '#1B1D21',
  '--ui-inactive-outline': '#2C2E33',
  '--ui-inactive-primary': '#4B5F7A',
  '--ui-inactive-secondary': '#2F3A4D',
  '--ui-inactive-tertiary': '#5A5E66',
  '--ui-inactive-quadrary': '#42454D',
  '--ui-inactive-error': '#D14D4D',
  '--ui-inactive-warning': '#E8BE3F',
  '--ui-inactive-success': '#2C914E',

  /* Text Colors */
  '--text-primary-button': '#F7F8FA',
  '--text-primary': '#F7F8FA',
  '--text-secondary': '#B2B5BD',
  '--text-tertiary': '#7C808A',
  '--text-inactive': '#616161',
  '--text-link': '#5F8DBF',
  '--text-error': '#CE2C2C',
  '--text-warning': '#FFDB6E',
  '--text-success': '#29CF60',

  /* Chart Colors */
  '--chart-100': '#FDA4AF',
  '--chart-200': '#C78FB4',
  '--chart-300': '#A24482',
  '--chart-400': '#F43F5E',
  '--chart-500': '#FDE047',
  '--chart-600': '#CA8A04',
  '--chart-700': '#A7F3D0',
  '--chart-800': '#34D399',
  '--chart-900': '#10B981',
  '--chart-1000': '#879ECF',
  '--chart-1100': '#375DAF',
  '--chart-1200': '#A188DE',
  '--chart-1300': '#6943C6'
}

export const themes: Record<string, Partial<CSSClasses>> = {
  light: lightTheme,
  dark: darkTheme
}

export const checkDarkMode = () => window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches

export const ThemeState = defineState({
  name: 'ThemeState',
  initial: () => {
    const initialDarkMode = checkDarkMode()

    return {
      theme: (initialDarkMode ? 'dark' : 'light') as 'light' | 'dark'
    }
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
      root.style.setProperty(variable, themeClasses[variable])
    }
  }
}

export const useThemeProvider = () => {
  const themeState = useMutableState(ThemeState)
  const themeClasses = themes[themeState.theme.value]

  useEffect(() => {
    const matchMedia = window.matchMedia('(prefers-color-scheme: dark)')
    const listener = (event) => {
      const newColorScheme = event.matches ? 'dark' : 'light'

      ThemeState.setTheme(newColorScheme)
    }

    matchMedia.addEventListener('change', listener)

    return () => {
      matchMedia.removeEventListener('change', listener)
    }
  }, [])

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

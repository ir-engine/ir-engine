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

import React, { createContext, useEffect, useLayoutEffect, useMemo, useState } from 'react'

export interface ThemeContextProps {
  theme: string
  setTheme: (theme: string) => void
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: 'default',
  setTheme: () => {}
})

/**
 * Theme Context Provider.
 *
 * @param value string
 * @param children ReactNode
 * @returns ReactNode
 */
export const ThemeContextProvider = ({
  value = 'default',
  children
}: {
  value?: string
  children: React.ReactNode
}) => {
  const [theme, setTheme] = useState(value)
  const useCustomEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect
  useCustomEffect(() => {
    const storeTheme = localStorage.getItem('theme')
    applyTheme(storeTheme || 'default')
  }, [])

  /**
   * Apply theme to 'html' tag on DOM.
   */
  const applyTheme = (theme = 'default') => {
    const newTheme = theme
    const html = document.getElementsByTagName('html')[0]
    localStorage.setItem('theme', theme)
    ;(html as HTMLHtmlElement).setAttribute('data-theme', newTheme)
  }

  const handleThemeChange = (theme: string) => {
    setTheme(theme)
    applyTheme(theme)
  }

  /**
   * Current context value for theme.
   */
  const val = useMemo(
    () => ({
      theme,
      setTheme: handleThemeChange
    }),
    [theme]
  )

  return <ThemeContext.Provider value={val}>{children}</ThemeContext.Provider>
}

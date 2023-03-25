import { SwatchIcon } from '@heroicons/react/20/solid'
import React, { useContext } from 'react'

import themes from '@etherealengine/client/src/themes/index'
import { ThemeContext } from '@etherealengine/client/src/themes/themeContext'

const ThemeSwitcher = () => {
  const { setTheme } = useContext(ThemeContext)
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-square">
        <SwatchIcon className="h-6 w-6" />
      </label>
      <ul tabIndex={1} className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52">
        {Object.keys(themes).map((key) => {
          return (
            <li key={key} onClick={() => setTheme(key)}>
              <a className="capitalize justify-between">{key}</a>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

ThemeSwitcher.displayName = 'ThemeSwitcher'

ThemeSwitcher.defaultProps = {}

export default ThemeSwitcher

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

import { SwatchIcon } from '@heroicons/react/20/solid'
import React, { useContext } from 'react'

import { themeNames } from '@etherealengine/client/src/themes/index'
import { ThemeContext } from '@etherealengine/client/src/themes/themeContext'

const ThemeSwitcher = () => {
  const { setTheme } = useContext(ThemeContext)
  return (
    <div className="dropdown dropdown-end">
      <label tabIndex={0} className="btn btn-ghost btn-square">
        <SwatchIcon className="h-6 w-6" />
      </label>
      <ul
        tabIndex={1}
        className="list-none menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
      >
        {themeNames.map((key) => {
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

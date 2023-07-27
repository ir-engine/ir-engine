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

import basicTheme from './basic'
import cupcakeTheme from './themes/cupcake'
import darkTheme from './themes/darkTheme'
import defaultTheme from './themes/defaultTheme'
import luxuryTheme from './themes/luxury'

const combineConfigs = (config1, config2) => ({
  ...config1,
  ...config2,
  theme: {
    ...config1.theme,
    ...config2.theme,
    extend: {
      ...config1.theme.extend,
      ...config2.theme.extend
    },
    colors: {
      ...config1.theme.colors,
      ...config2.theme.colors
    }
  }
})

const themeNames = ['default', 'dark', 'luxury', 'cupcake']
const themes = {
  default: combineConfigs(basicTheme, defaultTheme),
  dark: combineConfigs(basicTheme, darkTheme),
  luxury: combineConfigs(basicTheme, luxuryTheme),
  cupcake: combineConfigs(basicTheme, cupcakeTheme)
}

export { themes, themeNames }

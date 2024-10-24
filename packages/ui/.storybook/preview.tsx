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

import MetaTags from '@ir-engine/client-core/src/common/components/MetaTags'
import { ThemeState, useThemeProvider } from '@ir-engine/client-core/src/common/services/ThemeService'
import Engine from '@ir-engine/client/src/engine'
import { Description, Primary, Stories, Subtitle, Title } from '@storybook/addon-docs'
import { Preview } from '@storybook/react'
import React, { useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { I18nextProvider } from 'react-i18next'
import '../../client/src/themes/base.css'
import '../../client/src/themes/components.css'
import '../../client/src/themes/utilities.css'
import i18n from './i18n'

const ThemeProvider = () => {
  useThemeProvider()
  useEffect(() => ThemeState.setTheme('dark'), [])
  return null
}

export const decorators = [
  (Story: any) => (
    <Engine>
      <I18nextProvider i18n={i18n}>
        <DndProvider backend={HTML5Backend}>
          <ThemeProvider />
          <MetaTags>
            <link
              href="https://fonts.googleapis.com/css2?family=Figtree:ital,wght@0,300..900;1,300..900&display=swap"
              rel="stylesheet"
              type="text/css"
            />
          </MetaTags>
          <Story />
        </DndProvider>
      </I18nextProvider>
    </Engine>
  )
]

const preview: Preview = {
  globalTypes: {
    eeEnabled: {
      description: 'Infinite Reality Engine',
      defaultValue: false
    }
  },
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/
      }
    },
    options: {
      storySort: {
        order: ['Pages', 'Admin', 'Components', 'Primitives', 'Addons', 'Expermiental']
      }
    },
    docs: {
      source: {
        type: 'code'
      },
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Stories />
        </>
      )
    },
    actions: { argTypesRegex: '^on[A-Z].*' }
  }
}

export default preview

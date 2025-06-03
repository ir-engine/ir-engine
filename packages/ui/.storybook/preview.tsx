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

import { API as ClientAPI } from '@ir-engine/client-core/src/API'
import MetaTags from '@ir-engine/client-core/src/common/components/MetaTags'
import { createEngine, destroyEngine } from '@ir-engine/ecs'
import { destroySpatialEngine, initializeSpatialEngine } from '@ir-engine/spatial/src/initializeEngine'
import { startTimer } from '@ir-engine/spatial/src/startTimer'
import { Description, Primary, Stories, Subtitle, Title } from '@storybook/addon-docs'
import { Decorator, Preview } from '@storybook/react'
import { bypass, http, HttpResponse } from 'msw'
import { initialize, mswLoader } from 'msw-storybook-addon'
import React, { useEffect } from 'react'
import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { I18nextProvider } from 'react-i18next'
import '../../client/src/themes/base.css'
import '../../client/src/themes/components.css'
import '../../client/src/themes/utilities.css'
// @ts-ignore
import keycardGLB from '../../projects/default-project/assets/keycard.glb?url'
// @ts-ignore
import { reactRouterParameters, withRouter } from 'storybook-addon-remix-react-router'
// @ts-ignore
import apartmentGLTF from '../../projects/default-project/public/scenes/apartment.gltf?raw'
import EngineDecorator from './decorators/EngineDecorator'
import i18n from './i18n'
initialize()

export const decorators: Decorator[] = [
  withRouter,
  (Story) => {
    return (
      <I18nextProvider i18n={i18n}>
        <DndProvider backend={HTML5Backend}>
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
    )
  },
  (Story, args) => {
    const [engineInitialized, setEngineInitialized] = React.useState(false)

    useEffect(() => {
      if (engineInitialized) return
      createEngine()
      startTimer()
      ClientAPI.createAPI()
      initializeSpatialEngine()
      setEngineInitialized(true)
      return () => {
        destroySpatialEngine()
        destroyEngine()
      }
    }, [])

    if (!engineInitialized) return null

    return (
      <div className="h-screen w-screen">
        <EngineDecorator sceneName={args.globals.Scene}>
          <Story />
        </EngineDecorator>
        <canvas
          id="engine-renderer-canvas"
          style={{ zIndex: -1 }}
          className="absolute left-0 top-0 h-full w-full"
        ></canvas>
      </div>
    )
  }
]

const preview: Preview = {
  decorators,
  globalTypes: {
    Scene: {
      description: 'Scene',
      defaultValue: '',
      toolbar: {
        title: 'Location',
        icon: 'location',
        items: [
          { value: '', title: 'None' },
          { value: 'default.gltf', title: 'Default' },
          { value: 'apartment.gltf', title: 'Apartment' }
        ]
      }
    }
  },
  parameters: {
    reactRouter: reactRouterParameters({
      location: { pathParams: { screen: 'main' } },
      routing: { path: '/' }
    }),
    layout: 'fullscreen',
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
    msw: {
      handlers: [
        http.get(/apartment.gltf/g, async () => {
          return HttpResponse.json(JSON.parse(apartmentGLTF))
        }),
        http.get(/apartment.glb/g, async () => {
          //Two ways of returning assets. Fetch from the /public folder
          const glb = await fetch(bypass('/apartment.glb'))
          return glb
        }),
        http.get(/keycard.glb/g, async () => {
          //Or fetch internaly using the <import_path?url>
          const glbResponse = await fetch(keycardGLB)
          const arrayBuffer = await glbResponse.arrayBuffer()

          return HttpResponse.arrayBuffer(arrayBuffer, { headers: { 'Content-Type': 'model/gltf-binary' } })
        }),
        http.get(/platform.glb/g, async () => {
          const glb = await fetch(bypass('/platform.glb'))
          return glb
        })
      ]
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
  },
  loaders: [mswLoader]
}

export default preview

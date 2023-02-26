import { ComponentMeta, ComponentStory } from '@storybook/react'
import React, { useEffect } from 'react'

import { API } from '@xrengine/client-core/src/API'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@xrengine/engine/src/ecs/classes/EngineState'
import { initSystems, unloadSystems } from '@xrengine/engine/src/ecs/functions/SystemFunctions'
import { createEngine } from '@xrengine/engine/src/initializeEngine'
import { MotionCaptureModule } from '@xrengine/engine/src/mocap/MotionCaptureModule'
import { RealtimeNetworkingModule } from '@xrengine/engine/src/networking/RealtimeNetworkingModule'
import { dispatchAction } from '@xrengine/hyperflux'

import Mediapipe from './index'

const argTypes = {}

export default {
  title: 'Expermiental/Mediapipe',
  component: Mediapipe,
  decorators: [
    (Story) => {
      // @ts-ignore
      const projects = API.instance?.client.service('projects').find()

      useEffect(() => {
        createEngine()
      }, [])

      useEffect(() => {
        const systems = [...MotionCaptureModule(), ...RealtimeNetworkingModule(false, true)]

        initSystems(Engine.instance?.currentWorld, systems).then(() => {
          dispatchAction(EngineActions.initializeEngine({ initialised: true }))
        })

        return () => {
          unloadSystems(
            Engine.instance?.currentWorld,
            systems.map((s) => s.uuid)
          )
        }
      }, [projects])
      return <Story />
    }
  ],
  parameters: {
    componentSubtitle: 'Mediapipe',
    jest: 'Mediapipe.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Mediapipe>

const Template: ComponentStory<typeof Mediapipe> = (args) => <Mediapipe {...args} />

export const Default = Template.bind({})
Default.args = Mediapipe.defaultProps

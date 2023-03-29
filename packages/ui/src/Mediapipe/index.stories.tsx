import { ComponentMeta, ComponentStory } from '@storybook/react'
import React, { useEffect } from 'react'

import { API } from '@etherealengine/client-core/src/API'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { EngineActions } from '@etherealengine/engine/src/ecs/classes/EngineState'
import { initSystems, unloadSystems } from '@etherealengine/engine/src/ecs/functions/SystemFunctions'
import { createEngine } from '@etherealengine/engine/src/initializeEngine'
import { MotionCaptureModule } from '@etherealengine/engine/src/mocap/MotionCaptureModule'
import { RealtimeNetworkingModule } from '@etherealengine/engine/src/networking/RealtimeNetworkingModule'
import { dispatchAction } from '@etherealengine/hyperflux'

import Mediapipe from './index'

const argTypes = {}

export default {
  title: 'Experimental/Mediapipe',
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

        initSystems(systems).then(() => {
          dispatchAction(EngineActions.initializeEngine({ initialised: true }))
        })

        return () => {
          unloadSystems(systems.map((s) => s.uuid))
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

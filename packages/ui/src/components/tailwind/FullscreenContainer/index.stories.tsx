import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import FullscreenContainer from './index'

const argTypes = {}

export default {
  title: 'Primitives/Tailwind/FullscreenContainer',
  component: FullscreenContainer,
  parameters: {
    componentSubtitle: 'FullscreenContainer',
    jest: 'FullscreenContainer.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof FullscreenContainer>

const Template: ComponentStory<typeof FullscreenContainer> = (args) => <FullscreenContainer {...args} />

export const Default = Template.bind({})
Default.args = FullscreenContainer.defaultProps

import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Box from './index'

const argTypes = {}

export default {
  title: 'Components/Box',
  component: Box,
  parameters: {
    componentSubtitle: 'Box',
    jest: 'Box.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Box>

const Template: ComponentStory<typeof Box> = (args) => <Box {...args} />

export const Default = Template.bind({})
Default.args = Box.defaultProps

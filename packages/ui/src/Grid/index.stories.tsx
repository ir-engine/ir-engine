import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Grid from './index'

const argTypes = {}

export default {
  title: 'MUI/Grid',
  component: Grid,
  parameters: {
    componentSubtitle: 'Grid',
    jest: 'Grid.test.tsx',
    design: {
      type: 'figma',
      url: ''
    }
  },
  argTypes
} as ComponentMeta<typeof Grid>

const Template: ComponentStory<typeof Grid> = (args) => <Grid {...args} />

export const Default = Template.bind({})
Default.args = Grid.defaultProps

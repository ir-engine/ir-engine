import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import AppBar from './index'

const argTypes = {}

export default {
  title: 'Components/AppBar',
  component: AppBar,
  parameters: {
    componentSubtitle: 'AppBar',
    jest: 'AppBar.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof AppBar>

const Template: ComponentStory<typeof AppBar> = (args) => <AppBar {...args} />

export const Default = Template.bind({})
Default.args = AppBar.defaultProps

import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Switch from './index'

const argTypes = {}

export default {
  title: 'Components/Switch',
  component: Switch,
  parameters: {
    componentSubtitle: 'Switch',
    jest: 'Switch.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Switch>

const Template: ComponentStory<typeof Switch> = (args) => <Switch {...args} />

export const Default = Template.bind({})
Default.args = Switch.defaultProps

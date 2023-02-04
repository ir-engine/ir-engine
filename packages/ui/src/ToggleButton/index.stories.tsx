import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import ToggleButton from './index'

const argTypes = {}

export default {
  title: 'Components/ToggleButton',
  component: ToggleButton,
  parameters: {
    componentSubtitle: 'ToggleButton',
    jest: 'ToggleButton.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof ToggleButton>

const Template: ComponentStory<typeof ToggleButton> = (args) => <ToggleButton {...args} />

export const Default = Template.bind({})
Default.args = ToggleButton.defaultProps

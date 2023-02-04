import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Checkbox from './index'

const argTypes = {}

export default {
  title: 'Components/Checkbox',
  component: Checkbox,
  parameters: {
    componentSubtitle: 'Checkbox',
    jest: 'Checkbox.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Checkbox>

const Template: ComponentStory<typeof Checkbox> = (args) => <Checkbox {...args} />

export const Default = Template.bind({})
Default.args = Checkbox.defaultProps

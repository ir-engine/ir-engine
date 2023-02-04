import { ComponentMeta, ComponentStory } from '@storybook/react'
import * as React from 'react'

import Chip from './index'

const argTypes = {}

export default {
  title: 'Components/Chip',
  component: Chip,
  parameters: {
    componentSubtitle: 'Chip',
    jest: 'Chip.test.tsx',
    design: {
      type: 'figma',
      url: 'https://www.figma.com/file/gYlfhfHLTAJg8r0tqEtFyN/HyperConstruct-Landing-Page'
    }
  },
  argTypes
} as ComponentMeta<typeof Chip>

const Template: ComponentStory<typeof Chip> = (args) => <Chip {...args} />

export const Default = Template.bind({})
Default.args = Chip.defaultProps
